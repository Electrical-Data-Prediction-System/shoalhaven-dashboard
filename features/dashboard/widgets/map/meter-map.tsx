"use client"

import { useEffect } from "react"
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import WidgetForm from "@/features/dashboard/editor/create-widget"
import { useModal } from "@/components/forms/modal"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiData } from "@/hooks/use-ApiData"
import { GetMeterMap, type MeterMapPoint } from "@/lib/api"
import { markerRadius, meterGroup, METER_GROUPS, NO_DATA_COLOR, spreadOverlaps } from "@/lib/meter-map"

/** Leaflet measures its box once, so tell it again whenever the widget is resized */
function ResizeWatcher() {
  const map = useMap()

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return null
}

/** "Yalwal Road, Barringella New South Wales 2540, Australia" -> "Yalwal Road, Barringella" */
function shortAddress(address: string) {
  return address.replace(/,?\s*Australia$/, "").replace(/\s+(New South Wales|NSW)\s*\d*$/, "")
}

function MeterMarker({ point, maxKwh, onSelect }: { point: MeterMapPoint; maxKwh: number; onSelect: () => void }) {
  const hasData = point.totalKwh !== null
  const color = hasData ? METER_GROUPS[meterGroup(point.type)].color : NO_DATA_COLOR
  const [lon, lat] = point.coordinates

  return (
    <CircleMarker
      center={[lat, lon]}
      radius={hasData ? markerRadius(point.totalKwh!, maxKwh) : 5}
      // A white ring keeps touching circles apart; meters without data are hollow
      pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: hasData ? 0.85 : 0 }}
      eventHandlers={{ click: onSelect }}
    >
      <Tooltip direction="top" offset={[0, -6]}>
        <div className="space-y-0.5">
          <p className="font-semibold">{point.id} · {point.type}</p>
          <p>{shortAddress(point.fullAddress)}</p>
          <p>{hasData ? `${Math.round(point.totalKwh!).toLocaleString()} kWh in the last year` : "No readings"}</p>
          <p className="text-muted-foreground">Click to chart this meter</p>
        </div>
      </Tooltip>
    </CircleMarker>
  )
}

function Legend({ hidden }: { hidden: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
      {Object.entries(METER_GROUPS).map(([key, { label, color }]) => (
        <span key={key} className="flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-full border-2" style={{ borderColor: NO_DATA_COLOR }} />
        No readings
      </span>
      <span className="text-muted-foreground">Circle area = kWh used in the last year</span>
      {hidden > 0 && (
        <span className="text-muted-foreground">
          {hidden} {hidden === 1 ? "meter" : "meters"} hidden: location outside the Shoalhaven
        </span>
      )}
    </div>
  )
}

/** Every Shoalhaven meter on a map, sized by usage and coloured by facility type */
export default function MeterMap() {
  const { data, error, isLoading } = useApiData(GetMeterMap)
  const { openModal } = useModal()

  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className="text-sm text-destructive">Failed to load: {error.message}</p>
  if (!data) return null

  const shown = spreadOverlaps(data.filter((point) => point.inShoalhaven))
  const maxKwh = Math.max(0, ...shown.map((point) => point.totalKwh ?? 0))
  // Fit the view to the meters, as [south-west, north-east] in [lat, lon]
  const lats = shown.map(({ coordinates }) => coordinates[1])
  const lons = shown.map(({ coordinates }) => coordinates[0])
  const bounds: [[number, number], [number, number]] = [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ]

  // Smallest circles last so big ones don't cover them
  const ordered = [...shown].sort((a, b) => (b.totalKwh ?? 0) - (a.totalKwh ?? 0))

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
        <MapContainer bounds={bounds} boundsOptions={{ padding: [24, 24] }} className="h-full w-full" scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ResizeWatcher />
          {ordered.map((point) => (
            <MeterMarker
              key={point.id}
              point={point}
              maxKwh={maxKwh}
              onSelect={() => openModal(<WidgetForm initialMeterId={point.id} />)}
            />
          ))}
        </MapContainer>
      </div>
      <Legend hidden={data.length - shown.length} />
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useWidgetContext, type CreatedWidget } from "@/features/dashboard/context/widget-context"
import { useModal } from "@/components/forms/modal"
import { CHART_SERIES_COLORS, type ChartRow } from "@/lib/chart-data"
import { formatTableDate } from "@/features/dashboard/lib/chart-format"
import { WidgetVisualization } from "./widget-visualization"
import { getWidgetMeterIds } from "@/features/dashboard/lib/widget-data"

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "AUD",
})

type RatePeriod = { key: string; meterId: string; label: string; x: string; kwh: number }
const EMPTY_CHART_DATA: ChartRow[] = []

function getSydneyDateKey(value: string) {
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

function getRatePeriods(widget: CreatedWidget, data: ChartRow[]): RatePeriod[] {
  const groupByDay = widget.dataMode === "readings" || widget.timePeriod === "5m"
  const defaultMeterId = getWidgetMeterIds(widget)[0] ?? "kwh"
  const grouped = new Map<string, { meterId: string; key: string; kwh: number }>()

  for (const row of data) {
    const key = groupByDay
      ? widget.dataMode === "readings"
        ? row.x.slice(0, 10)
        : getSydneyDateKey(row.x)
      : row.x
    const meterId = row.series ?? defaultMeterId
    const compositeKey = `${meterId}\u0000${key}`
    const current = grouped.get(compositeKey)
    grouped.set(compositeKey, { meterId, key, kwh: (current?.kwh ?? 0) + row.kwh })
  }

  return [...grouped.values()].sort((left, right) =>
    left.meterId.localeCompare(right.meterId) || left.key.localeCompare(right.key),
  ).map(({ meterId, key, kwh }) => {
    const label = groupByDay
      ? new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${key}T00:00:00Z`))
      : formatTableDate(key, widget.dataMode, widget.timePeriod)
    return { key, meterId, kwh, label, x: groupByDay ? label : key }
  })
}

export function WidgetFullscreen({
  widget,
  data,
  error,
  isLoading,
}: {
  widget: CreatedWidget
  data?: ChartRow[]
  error?: Error
  isLoading: boolean
}) {
  const { closeModal } = useModal()
  const { updateCreatedWidgetRates, updateCreatedWidgetColors } = useWidgetContext()
  const [metric, setMetric] = useState<"energy" | "cost">("energy")
  const meterIds = getWidgetMeterIds(widget)
  const [draftRates, setDraftRates] = useState<Record<string, Record<string, number>>>(() => {
    if (widget.ratesByMeterPeriod) return widget.ratesByMeterPeriod
    if (widget.ratesByPeriod && meterIds[0]) return { [meterIds[0]]: widget.ratesByPeriod }
    return {}
  })
  const [draftColors, setDraftColors] = useState<Record<string, string>>(() => {
    const colors = { ...(widget.colorsByMeter ?? {}) }
    if (widget.seriesColor && meterIds[0] && !colors[meterIds[0]]) {
      colors[meterIds[0]] = widget.seriesColor
    }
    return colors
  })
  const [baseRate, setBaseRate] = useState("")
  const [selectedMeterId, setSelectedMeterId] = useState(meterIds[0] ?? "")
  const [selectedPeriodKeys, setSelectedPeriodKeys] = useState<string[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const chartData = data ?? EMPTY_CHART_DATA
  const chartSeriesNames = [...new Set(chartData.map(({ series }) => series ?? "kwh"))]
  const getMeterColor = (meterId: string) =>
    draftColors[meterId] ??
    CHART_SERIES_COLORS[Math.max(0, chartSeriesNames.indexOf(meterId)) % CHART_SERIES_COLORS.length]
  const ratePeriods = useMemo(() => getRatePeriods(widget, chartData), [widget, chartData])
  const meterPeriods = ratePeriods.filter(({ meterId }) => meterId === selectedMeterId)
  const selectedPeriods = meterPeriods.filter(({ key }) => selectedPeriodKeys.includes(key))
  const ratesForSelectedMeter = draftRates[selectedMeterId] ?? {}
  const costData = ratePeriods.flatMap((period) => {
    const rate = draftRates[period.meterId]?.[period.key]
    return rate === undefined
      ? []
      : [{ x: period.x, kwh: (period.kwh * rate) / 100, series: period.meterId }]
  })
  const totalCost = ratePeriods.reduce(
    (sum, period) => sum + (period.kwh * (draftRates[period.meterId]?.[period.key] ?? 0)) / 100,
    0,
  )
  const missingRateCount = ratePeriods.filter(
    ({ meterId, key }) => draftRates[meterId]?.[key] === undefined,
  ).length

  const applyRateToSelected = () => {
    if (baseRate.trim() === "") return
    const rate = Number(baseRate)
    if (!Number.isFinite(rate) || rate < 0 || !selectedPeriods.length) return
    setDraftRates((current) => {
      const meterRates = { ...(current[selectedMeterId] ?? {}) }
      for (const period of selectedPeriods) meterRates[period.key] = rate
      return { ...current, [selectedMeterId]: meterRates }
    })
    setIsSaved(false)
  }

  const saveRates = () => {
    updateCreatedWidgetRates(widget.id, draftRates)
    updateCreatedWidgetColors(widget.id, draftColors)
    setIsSaved(true)
  }

  const displayData = metric === "cost" ? costData : chartData

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main className="flex min-h-0 flex-col gap-3">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{widget.name}</h2>
            <p className="text-xs text-muted-foreground">{getWidgetMeterIds(widget).join(", ")}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-md border p-0.5">
              <Button type="button" size="sm" variant={metric === "energy" ? "secondary" : "ghost"} onClick={() => setMetric("energy")}>
                kWh
              </Button>
              <Button type="button" size="sm" variant={metric === "cost" ? "secondary" : "ghost"} onClick={() => setMetric("cost")}>
                Cost
              </Button>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close expanded chart" title="Close" onClick={closeModal}>
              <X />
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          {isLoading && <Skeleton className="h-full w-full" />}
          {error && <p className="p-2 text-sm text-destructive">Failed to load: {error.message}</p>}
          {!isLoading && !error && metric === "cost" && !costData.length && (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Set an energy rate to view estimated cost.
            </p>
          )}
          {!isLoading && !error && metric === "energy" && !chartData.length && (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No readings found for this meter and time range.
            </p>
          )}
          {!isLoading && !error && displayData.length > 0 && (
            <WidgetVisualization
              widget={widget}
              data={displayData}
              unit={metric === "cost" ? "AUD" : "kWh"}
              seriesColors={draftColors}
            />
          )}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-t pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        <div>
          <h3 className="text-sm font-semibold">Meter colors</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a color for each meter series.
          </p>
        </div>
        {meterIds.map((meterId) => (
          <div key={meterId} className="flex min-w-0 items-center gap-3">
            <Input
              type="color"
              aria-label={`Chart color for ${meterId}`}
              className="h-9 w-14 shrink-0 cursor-pointer p-1"
              value={getMeterColor(meterId)}
              onChange={(event) => {
                setDraftColors((current) => ({ ...current, [meterId]: event.target.value }))
                setIsSaved(false)
              }}
            />
            <span className="truncate font-mono text-xs" title={meterId}>{meterId}</span>
          </div>
        ))}

        <div className="border-t pt-4">
          <h3 className="text-sm font-semibold">Energy pricing</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose a meter and one or more periods, then apply a rate per kWh.
          </p>
        </div>

        <div className="grid gap-2 border-b pb-4">
          <label htmlFor="rate-meter" className="text-sm font-medium">Meter</label>
          <Select
            value={selectedMeterId}
            onValueChange={(value) => {
              setSelectedMeterId(value ?? "")
              setSelectedPeriodKeys([])
            }}
          >
            <SelectTrigger id="rate-meter" className="w-full">
              <SelectValue placeholder="Select a meter" />
            </SelectTrigger>
            <SelectContent>
              {meterIds.map((meterId) => (
                <SelectItem key={meterId} value={meterId}>{meterId}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Periods</label>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setSelectedPeriodKeys(meterPeriods.map(({ key }) => key))}
              >
                Select all
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSelectedPeriodKeys([])}>
                Clear
              </Button>
            </div>
          </div>
          <div className="max-h-36 space-y-1 overflow-y-auto rounded-md border p-2">
            {meterPeriods.map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedPeriodKeys.includes(key)}
                  onChange={(event) => setSelectedPeriodKeys((current) =>
                    event.target.checked
                      ? [...current, key]
                      : current.filter((periodKey) => periodKey !== key),
                  )}
                />
                <span>{label}</span>
                {ratesForSelectedMeter[key] !== undefined && (
                  <span className="ml-auto text-xs text-muted-foreground">{ratesForSelectedMeter[key]}¢/kWh</span>
                )}
              </label>
            ))}
            {meterPeriods.length === 0 && (
              <p className="text-xs text-muted-foreground">No periods available for this meter.</p>
            )}
          </div>

          <label htmlFor="base-rate" className="text-sm font-medium">Rate for selected periods</label>
          <div className="flex gap-2">
            <Input
              id="base-rate"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="Cents per kWh"
              value={baseRate}
              onChange={(event) => setBaseRate(event.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyRateToSelected}
              disabled={!selectedPeriods.length || !baseRate.trim()}
            >
              Apply
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedPeriods.length} period{selectedPeriods.length === 1 ? "" : "s"} selected.
          </p>
        </div>

        <div className="mt-auto border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {missingRateCount > 0 ? `${missingRateCount} meter-periods still need a rate` : "All meter-periods have a rate"}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {missingRateCount > 0 ? "Priced subtotal" : "Estimated total"}: {currencyFormatter.format(totalCost)}
          </p>
          <Button type="button" className="mt-3 w-full" onClick={saveRates} disabled={!ratePeriods.length}>
            {isSaved ? "Rates saved" : "Save rates"}
          </Button>
        </div>
      </aside>
    </div>
  )
}

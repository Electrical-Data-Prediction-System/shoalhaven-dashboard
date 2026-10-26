"use client"

import { useApiData } from "@/hooks/use-ApiData"
import { loadCachedWidgetData, loadWidgetForecast } from "@/features/dashboard/lib/widget-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWidgetContext, type CreatedWidget } from "@/features/dashboard/context/widget-context"
import WidgetForm from "@/features/dashboard/editor/create-widget"
import { useModal } from "@/components/forms/modal"
import type { ChartRow } from "@/lib/chart-data"
import type { ApiForecast } from "@/lib/api"
import { WidgetVisualization } from "./widget-visualization"
import { WidgetFullscreen } from "./widget-fullscreen"
import { getWidgetMeterIds } from "@/features/dashboard/lib/widget-data"
import { useAlertRules } from "@/features/dashboard/alerts/use-alerts"

interface WidgetBodyProps {
  widget: CreatedWidget,
  data?: ChartRow[],
  error?: Error,
  isLoading: boolean
  forecast?: ApiForecast | null
  limits?: { lower?: number; upper?: number }
}

function WidgetBody({ widget, data, error, isLoading, forecast, limits }: WidgetBodyProps) {
  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className=" break-words p-2 text-sm text-destructive" title={error.message}>Failed to load: {error.message}</p>
  if (!data?.length) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No readings found for this meter and time range.
      </p>
    )
  }
  const seriesColors = widget.colorsByMeter ?? {}
  return <WidgetVisualization widget={widget} data={data} seriesColors={seriesColors} forecast={forecast} limits={limits} />
}

export function CreatedWidgetCard({ widget }: { widget: CreatedWidget }) {
  const meterIds = getWidgetMeterIds(widget)
  const { data, error, isLoading } = useApiData(
    () => loadCachedWidgetData(widget),
    [widget.id, meterIds.join(","), widget.dataMode, widget.timePeriod],
  )
  // A forecast that fails to load is left off rather than failing the chart
  const { data: forecast } = useApiData(
    () => loadWidgetForecast(widget),
    [widget.id, meterIds.join(","), widget.type, widget.dataMode, widget.timePeriod, widget.showForecast],
  )
  // Alert limits are daily kWh, so they only make sense on a single-meter daily chart
  const { rules } = useAlertRules()
  const rule = meterIds.length === 1 && widget.dataMode === "aggregate" && widget.timePeriod === "day"
    ? rules.find(({ meterId }) => meterId === meterIds[0])
    : undefined
  const limits = rule ? { lower: rule.lower, upper: rule.upper } : undefined
  const { deleteCreatedWidget } = useWidgetContext()
  const { openModal, closeModal } = useModal()
  const chartData = data ?? []

  const openFullscreen = () => {
    openModal(
      <WidgetFullscreen widget={widget} data={data} error={error} isLoading={isLoading} forecast={forecast} />,
      "fullscreen",
    )
  }

  const confirmDelete = () => {
    openModal(
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Delete widget?</h2>
        <p className="text-sm text-muted-foreground">
          “{widget.name}” will be removed from this dashboard.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              deleteCreatedWidget(widget.id)
              closeModal()
            }}
          >
            Delete
          </Button>
        </div>
      </div>,
    )
  }

  return (
    <section className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/70 pb-2.5">
        <h3
          className="flex min-w-0 items-center gap-2 text-base font-semibold leading-tight tracking-tight"
          title={widget.name}
        >
          <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-primary/70" />
          <span className="truncate">{widget.name}</span>
        </h3>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={`Maximize ${widget.name}`}
            title="Maximize chart"
            onClick={openFullscreen}
          >
            <Maximize2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={`Edit ${widget.name}`}
            title="Edit widget"
            onClick={() => openModal(<WidgetForm initialWidget={widget} />)}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer"
            aria-label={`Delete ${widget.name}`}
            title="Delete widget"
            onClick={confirmDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <WidgetBody widget={widget} data={chartData} error={error} isLoading={isLoading} forecast={forecast} limits={limits} />
      </div>
    </section>
  )
}

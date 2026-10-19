"use client"

import { useApiData } from "@/hooks/use-ApiData"
import { loadWidgetData } from "@/lib/widget-data"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWidgetContext, type CreatedWidget } from "@/contexts/widget-context"
import WidgetForm from "@/components/forms/create-widget"
import { useModal } from "@/components/forms/modal"
import type { ChartRow } from "@/lib/chart-data"
import { WidgetVisualization } from "./widget-visualization"
import { WidgetFullscreen } from "./widget-fullscreen"

function WidgetBody({
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
  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className="p-2 text-sm text-destructive">Failed to load: {error.message}</p>
  if (!data?.length) {
    return (
      <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No readings found for this meter and time range.
      </p>
    )
  }
  return <WidgetVisualization widget={widget} data={data} />
}

export function CreatedWidgetCard({ widget }: { widget: CreatedWidget }) {
  const { data, error, isLoading } = useApiData(
    () => loadWidgetData(widget),
    [widget.id, widget.meterId, widget.dataMode, widget.timePeriod],
  )
  const { deleteCreatedWidget } = useWidgetContext()
  const { openModal, closeModal } = useModal()
  const chartData = data ?? []

  const openFullscreen = () => {
    openModal(
      <WidgetFullscreen widget={widget} data={data} error={error} isLoading={isLoading} />,
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
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="truncate text-sm font-semibold">{widget.name}</h3>
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
        <WidgetBody widget={widget} data={chartData} error={error} isLoading={isLoading} />
      </div>
    </section>
  )
}

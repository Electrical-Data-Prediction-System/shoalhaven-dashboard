"use client"

import { useApiData } from "@/hooks/use-ApiData"
import { loadWidgetData } from "@/lib/widget-data"
import { Skeleton } from "@/components/ui/skeleton"
import { BarGraph } from "./bar-graph"
import { LineGraph } from "./line-graph"
import { PieGraph } from "./pie-graph"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWidgetContext, type CreatedWidget } from "@/contexts/widget-context"
import WidgetForm from "@/components/forms/create-widget"
import { useModal } from "@/components/forms/modal"

export function CreatedWidgetCard({ widget }: { widget: CreatedWidget }) {
  const { data, error, isLoading } = useApiData(
    () => loadWidgetData(widget),
    [widget.id, widget.meterId, widget.dataMode, widget.timePeriod],
  )
  const { deleteCreatedWidget } = useWidgetContext()
  const { openModal, closeModal } = useModal()
  const chartData = data ?? []
  const hasData = chartData.some((series) => series.data.length > 0)

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
            aria-label={`Delete ${widget.name}`}
            title="Delete widget"
            onClick={confirmDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        {isLoading && <Skeleton className="h-full w-full" />}
        {error && <p className="p-2 text-sm text-destructive">Failed to load: {error.message}</p>}
        {!isLoading && !error && !hasData && (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No readings found for this meter and time range.
          </p>
        )}
        {hasData && widget.type === "line" && (
          <LineGraph
            series={chartData}
            unit="kWh"
            dataMode={widget.dataMode}
            timePeriod={widget.timePeriod}
          />
        )}
        {hasData && widget.type === "bar" && <BarGraph series={chartData} unit="kWh" />}
        {hasData && widget.type === "pie" && <PieGraph series={chartData} unit="kWh" />}
        {hasData && widget.type === "datatable" && (
          <div className="h-full overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b">
                  <th className="p-2 font-medium">Time</th>
                  <th className="p-2 text-right font-medium">KWH</th>
                </tr>
              </thead>
              <tbody>
                {chartData.flatMap((series) => series.data.map((point) => (
                  <tr key={`${series.id}-${point.x}`} className="border-b last:border-0">
                    <td className="p-2">{point.x}</td>
                    <td className="p-2 text-right">{point.y}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

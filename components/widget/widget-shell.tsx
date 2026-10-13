"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { useApiData } from "@/hooks/use-ApiData"
import { cn } from "@/lib/utils"
import { isDataWidget, type DataWidget, type WidgetDefinition } from "./types"

/**
 * Base frame shared by every widget: card chrome + title
 *
 * Data-fetching widgets get their loader run here, with loading / error states
 * handled centrally; static widgets render straight through. Widget content
 * components should NOT render their own card or title
 */
export function WidgetShell({ def }: { def: WidgetDefinition }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm",
        def.overflow === "hidden" && "overflow-hidden",
      )}
    >
      <h3 className="mb-2 text-sm font-semibold">{def.title}</h3>
      <div className="min-h-0 flex-1">
        <WidgetContent def={def} />
      </div>
    </div>
  )
}

function WidgetContent({ def }: { def: WidgetDefinition }) {
  if (!isDataWidget(def)) return <>{def.render()}</>
  return <DataWidgetContent def={def} />
}

function DataWidgetContent({ def }: { def: DataWidget }) {
  const { data, error, isLoading } = useApiData(def.load)

  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className="p-2 text-sm text-destructive">Failed to load: {error.message}</p>
  if (!data) return null

  return <>{def.render(data)}</>
}

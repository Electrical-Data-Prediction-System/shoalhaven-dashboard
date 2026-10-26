"use client"

import { memo, useState } from "react"
import { Maximize2, Pencil, Trash2, X, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useModal } from "@/components/forms/modal"
import { useWidgetContext } from "@/features/dashboard/context/widget-context"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiData } from "@/hooks/use-ApiData"
import { cn } from "@/lib/utils"
import { isDataWidget, type DataWidget, type PlacedWidget, type WidgetDefinition } from "./types"

/**
 * Base frame shared by every widget: card chrome + title
 *
 * Data-fetching widgets get their loader run here, with loading / error states
 * handled centrally; static widgets render straight through. Widget content
 * components should NOT render their own card or title
 */
export const WidgetShell = memo(function WidgetShell({
  def,
  widget,
}: {
  def: WidgetDefinition
  widget: PlacedWidget
}) {
  const { placed, setPlaced } = useWidgetContext()
  const { openModal, closeModal } = useModal()
  const title = widget.title ?? def.title

  const confirmDelete = () => {
    openModal(
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Delete widget?</h2>
        <p className="text-sm text-muted-foreground">“{title}” will be removed from this dashboard.</p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              setPlaced(placed.filter((item) => item.id !== widget.id))
              closeModal()
            }}
          >
            Delete
          </Button>
        </div>
      </div>,
    )
  }

  const editTitle = () => {
    openModal(
      <EditWidgetTitle
        title={title}
        onSave={(nextTitle) => {
          setPlaced(placed.map((item) =>
            item.id === widget.id ? { ...item, title: nextTitle } : item,
          ))
          closeModal()
        }}
      />,
    )
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm",
        def.overflow === "hidden" && "overflow-hidden",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/70 pb-2.5">
        <h3 className="min-w-0 truncate text-sm font-semibold" title={title}>{title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Maximize ${title}`}
            title="Maximize widget"
            onClick={() => openModal(<WidgetFullscreen title={title} def={def} widget={widget} />, "fullscreen")}
          >
            <Maximize2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${title}`}
            title="Edit widget title"
            onClick={editTitle}
          >
            <Pencil />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${title}`}
            title="Delete widget"
            onClick={confirmDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 line-clamp-3 overflow-hidden">
        <WidgetContent def={def} widget={widget} />
      </div>
    </div>
  )
})

function EditWidgetTitle({ title, onSave }: { title: string; onSave: (title: string) => void }) {
  const [value, setValue] = useState(title)
  const { closeModal } = useModal()

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        const nextTitle = value.trim()
        if (nextTitle) onSave(nextTitle)
      }}
    >
      <div>
        <h2 className="text-lg font-semibold">Edit widget</h2>
        <p className="mt-1 text-sm text-muted-foreground">Change the title shown on your dashboard.</p>
      </div>
      <Input aria-label="Widget title" value={value} onChange={(event) => setValue(event.target.value)} autoFocus />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
        <Button type="submit" disabled={!value.trim()}>Save</Button>
      </div>
    </form>
  )
}

function WidgetFullscreen({ title, def, widget }: { title: string; def: WidgetDefinition; widget: PlacedWidget }) {
  const { closeModal } = useModal()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b pb-3">
        <h2 className="truncate text-lg font-semibold">{title}</h2>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close expanded widget" title="Close" onClick={closeModal}>
          <X />
        </Button>
      </header>
      <div className="min-h-0 flex-1">
        <WidgetContent def={def} widget={widget} />
      </div>
    </div>
  )
}

function WidgetContent({ def, widget }: { def: WidgetDefinition; widget: PlacedWidget }) {
  if (!isDataWidget(def)) return <>{def.render(widget)}</>
  return <DataWidgetContent def={def} />
}

function DataWidgetContent({ def }: { def: DataWidget }) {
  const { data, error, isLoading } = useApiData(def.load)

  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className="line-clamp-3 break-words p-2 text-sm text-destructive" title={error.message}>Failed to load: {error.message}</p>
  if (!data) return null

  return <>{def.render(data)}</>
}

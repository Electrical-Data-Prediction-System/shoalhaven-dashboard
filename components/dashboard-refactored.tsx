"use client"

import { useEffect, useMemo } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout"
import "react-grid-layout/css/styles.css"

import { WidgetShell } from "@/components/widget/widget-shell"
import { CreatedWidgetCard } from "@/components/widget/created-widget-card"
import { WIDGETS } from "@/components/widget/widgets"
import { DEFAULT_PLACED, useWidgetContext } from "@/contexts/widget-context"
import { cn } from "@/lib/utils"

export function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true })

  // The placed widgets — which ones exist, plus their size and position.
  const { highlightedId, createdWidgets, updateCreatedWidgetLayouts, placed, setPlaced } = useWidgetContext()

  // Ignore anything persisted that no longer matches a registered widget.
  const validPlaced = useMemo(() => {
    const source = Array.isArray(placed) ? placed : DEFAULT_PLACED
    return source.filter((p) => Boolean(p) && Boolean(p.layout) && p.type in WIDGETS)
  }, [placed])

  const layouts: ResponsiveLayouts = useMemo(
    () => ({
      lg: [
        ...validPlaced.map((p) => ({
          i: p.id,
          x: p.layout.x,
          y: p.layout.y,
          w: p.layout.w,
          h: p.layout.h,
        })),
        ...createdWidgets.map(({ id, layout }, index) => ({
          i: id,
          ...(layout ?? { x: 0, y: 10 + index * 4, w: 4, h: 4 }),
        })),
      ],
    }),
    [validPlaced, createdWidgets],
  )

  const persistLayout = (items: readonly LayoutItem[]) => {
    const next = validPlaced.map((p) => {
      const item = items.find((entry) => entry.i === p.id)
      if (!item) return p
      if (item.x === p.layout.x && item.y === p.layout.y && item.w === p.layout.w && item.h === p.layout.h) {
        return p
      }
      return { ...p, layout: { x: item.x, y: item.y, w: item.w, h: item.h } }
    })
    if (next.some((p, index) => p !== validPlaced[index])) setPlaced(next)
    updateCreatedWidgetLayouts(items)
  }

  useEffect(() => {
    if(!highlightedId) return

    document
      .querySelector(`[data-widget-id="${highlightedId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center"})
  }, [highlightedId])


  const ringClass = (id: string) => cn(
    "h-full rounded-xl transition-shadow duration-1000",
    highlightedId === id && "duration-300 ring-4 ring-amber-400 shadow-lg shadow-amber-400/50"
  )

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={80}
          margin={[16, 16]}
          onDragStop={(layout) => {
            containerRef.current?.classList.remove("select-none")
            persistLayout(layout)
          }}
          onResizeStop={(layout) => persistLayout(layout)}
          onDragStart={() => {
            containerRef.current?.classList.add("select-none")
            window.getSelection()?.removeAllRanges()
          }}
        >
          {validPlaced.map((placed) => (
            <div key={placed.id} data-widget-id={placed.id}>
              <div className={ringClass(placed.id)}>
                <WidgetShell def={WIDGETS[placed.type]} />
              </div>
            </div>
          ))}

          {createdWidgets.map((widget) => (
            <div key={widget.id} data-widget-id={widget.id}>
              <div className={ringClass(widget.id)}>
                <CreatedWidgetCard widget={widget} />
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}

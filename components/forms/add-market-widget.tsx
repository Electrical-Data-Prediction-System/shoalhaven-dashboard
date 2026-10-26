"use client"

import { Button } from "@/components/ui/button"
import { useWidgetContext } from "@/features/dashboard/context/widget-context"
import { WIDGETS, type WidgetType } from "@/features/dashboard/widgets/widgets"
import { MARKET_SOURCE } from "@/lib/market"
import { useModal } from "./modal"

const MARKET_WIDGETS = (Object.keys(WIDGETS) as WidgetType[]).filter(
  (type) => "category" in WIDGETS[type] && WIDGETS[type].category === "market",
)

/** Lists the built-in market widgets; picking one adds a new copy to the bottom of the dashboard */
export default function AddMarketWidget() {
  const { closeModal } = useModal()
  const { addPlacedWidget, highlight } = useWidgetContext()

  const add = (type: WidgetType) => {
    const id = addPlacedWidget(type, WIDGETS[type].defaultSize)
    closeModal()
    // Wait a frame so the new widget is on the grid before scrolling to it
    requestAnimationFrame(() => highlight(id))
  }

  return (
    <div className="modal-content">
      <div className="mb-4 border-b border-border pb-4">
        <h2 className="text-xl font-semibold tracking-tight">Add market widget</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          NSW wholesale prices and solar output for 2025. Each widget has its own season filter.
        </p>
      </div>
      <ul className="space-y-2">
        {MARKET_WIDGETS.map((type) => {
          const def = WIDGETS[type]
          return (
            <li key={type}>
              <button
                type="button"
                onClick={() => add(type)}
                className="w-full cursor-pointer rounded-lg border p-3 text-left transition-colors hover:bg-muted"
              >
                <span className="block text-sm font-medium">{def.title}</span>
                <span className="block text-xs text-muted-foreground">{"description" in def ? def.description : null}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
        <p className="text-[11px] text-muted-foreground">{MARKET_SOURCE}</p>
        <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
      </div>
    </div>
  )
}

import type { ReactNode } from "react"
import type { ApiPowerResponse } from "@/lib/chart-data"

export type WidgetSize = { w: number; h: number }

type WidgetBase = {
  /** Title rendered by the widget shell */
  title: string
  /** Default size used when the widget is dropped onto the grid */
  defaultSize: WidgetSize
  /** Adds `overflow-hidden` to the shell for widgets that clip their content */
  overflow?: "hidden" | "visible"
  /** Groups built-ins that users add themselves from a picker, e.g. "market" */
  category?: "market"
  /** One line shown in the add-widget picker */
  description?: string
  // TODO: enforce minSize / maxSize while resizing
  minSize?: WidgetSize
  maxSize?: WidgetSize
}

/** A widget that fetches its own data before rendering */
export type DataWidget = WidgetBase & {
  load: () => Promise<ApiPowerResponse>
  render: (data: ApiPowerResponse) => ReactNode
}

/** A widget with no data source, or one that loads its own data from its saved options */
export type StaticWidget = WidgetBase & {
  render: (widget: PlacedWidget) => ReactNode
}

export type WidgetDefinition = DataWidget | StaticWidget

/** Narrows a definition to the data-fetching variant */
export function isDataWidget(def: WidgetDefinition): def is DataWidget {
  return "load" in def
}

/** Position + size of a placed widget, matching react-grid-layout items */
export type WidgetLayout = { x: number; y: number; w: number; h: number }

/** A widget instance placed on the dashboard (persisted to storage) */
export type PlacedWidget<TType extends string = string> = {
  id: string
  type: TType
  /** Optional dashboard-specific title override for built-in widgets */
  title?: string
  layout: WidgetLayout
  /** Per-widget settings saved with the layout, e.g. { season: "winter" } */
  options?: Record<string, string>
}

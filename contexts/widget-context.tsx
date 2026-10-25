"use client"

import { createContext, ReactNode, useContext, useRef, useState } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import type { PlacedWidget } from "@/components/widget/types"
import type { WidgetType } from "@/components/widget/widgets"
import type { MeterSearchResult } from "@/lib/api"

export const DEFAULT_PLACED: PlacedWidget<WidgetType>[] = [
    { id: "energy-consumption", type: "energy-consumption", layout: { x: 0, y: 0, w: 3, h: 2 } },
    { id: "peak-load", type: "peak-load", layout: { x: 3, y: 0, w: 3, h: 2 } },
    { id: "current-load", type: "current-load", layout: { x: 6, y: 0, w: 3, h: 2 } },
    { id: "meter-power-usage", type: "meter-power-usage", layout: { x: 0, y: 2, w: 6, h: 4 } },
    // { id: "cost-overview", type: "cost-overview", layout: { x: 6, y: 2, w: 2, h: 4 } },
    // { id: "station-power-usage", type: "station-power-usage", layout: { x: 0, y: 6, w: 4, h: 4 } },
    // { id: "energy-cost", type: "energy-cost", layout: { x: 2, y: 2, w: 4, h: 4 } } Already a stat card lol
  ]

const STORAGE_KEY = "dashboard.widgets"

export type WidgetFormConfig = {
    name: string
    type: "line" | "area" | "bar" | "pie" | "datatable"
    dataMode: "aggregate" | "readings"
    timePeriod: "5m" | "day" | "week" | "month" | "year"
    meterIds: string[]
    meterDetails?: MeterSearchResult[]
}

export type CreatedWidgetLayout = { x: number; y: number; w: number; h: number }
export type CreatedWidget = Omit<WidgetFormConfig, "meterIds"> & {
    id: string
    meterIds?: string[]
    /** Legacy field retained so previously saved widgets keep loading. */
    meterId?: string
    layout?: CreatedWidgetLayout
    ratesByPeriod?: Record<string, number>
    seriesColor?: string
    ratesByMeterPeriod?: Record<string, Record<string, number>>
    colorsByMeter?: Record<string, string>
}

type GridPosition = { i: string; x: number; y: number; w: number; h: number }

type WidgetContextValue = {
    highlightedId: string | null
    highlight: (id : string) => void
    createdWidgets: CreatedWidget[]
    onCreateWidget: (config: WidgetFormConfig) => CreatedWidget
    updateCreatedWidget: (id: string, config: WidgetFormConfig) => void
    updateCreatedWidgetRates: (id: string, rates: Record<string, Record<string, number>>) => void
    updateCreatedWidgetColors: (id: string, colors: Record<string, string>) => void
    deleteCreatedWidget: (id: string) => void
    updateCreatedWidgetLayouts: (items: readonly GridPosition[]) => void

    placed: PlacedWidget<WidgetType>[]
    setPlaced: (value: PlacedWidget<WidgetType>[]) => void

}

const WidgetContext = createContext<WidgetContextValue | null>(null)
const CREATED_WIDGETS_KEY = "dashboard.createdWidgets"

export function WidgetProvider({ children }: { children : ReactNode})
{
    const [placed, setPlaced] = useLocalStorage<PlacedWidget<WidgetType>[]>(STORAGE_KEY, DEFAULT_PLACED)



    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const [createdWidgets, setCreatedWidgets] = useLocalStorage<CreatedWidget[]>(CREATED_WIDGETS_KEY, [])
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const highlight = (id: string) => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
        setHighlightedId(id)
        timeoutRef.current = setTimeout(() => setHighlightedId(null), 2000)
        console.log("highlight", id)
    }

    const onCreateWidget = (config: WidgetFormConfig) => {
        const widget = {
            ...config,
            id: crypto.randomUUID(),
            layout: { x: 0, y: 10 + createdWidgets.length * 4, w: 4, h: 4 },
        }
        setCreatedWidgets([...createdWidgets, widget])
        return widget
    }

    const updateCreatedWidget = (id: string, config: WidgetFormConfig) => {
        setCreatedWidgets(createdWidgets.map((widget) =>
            widget.id === id ? { ...widget, ...config, id: widget.id, layout: widget.layout } : widget
        ))
    }

    const updateCreatedWidgetRates = (id: string, rates: Record<string, Record<string, number>>) => {
        setCreatedWidgets(createdWidgets.map((widget) =>
            widget.id === id ? { ...widget, ratesByMeterPeriod: rates } : widget
        ))
    }

    const updateCreatedWidgetColors = (id: string, colors: Record<string, string>) => {
        setCreatedWidgets(createdWidgets.map((widget) =>
            widget.id === id ? { ...widget, colorsByMeter: colors } : widget
        ))
    }

    const deleteCreatedWidget = (id: string) => {
        setCreatedWidgets(createdWidgets.filter((widget) => widget.id !== id))
    }

    const updateCreatedWidgetLayouts = (items: readonly GridPosition[]) => {
        const next = createdWidgets.map((widget) => {
            const item = items.find(({ i }) => i === widget.id)
            if (!item) return widget
            if (widget.layout && item.x === widget.layout.x && item.y === widget.layout.y && item.w === widget.layout.w && item.h === widget.layout.h) {
                return widget
            }
            return { ...widget, layout: { x: item.x, y: item.y, w: item.w, h: item.h } }
        })
        if (next.some((widget, index) => widget !== createdWidgets[index])) {
            setCreatedWidgets(next)
        }
    }

    return (
        <WidgetContext.Provider value={{
            highlightedId,
            highlight,
            createdWidgets,
            onCreateWidget,
            updateCreatedWidget,
            updateCreatedWidgetRates,
            updateCreatedWidgetColors,
            deleteCreatedWidget,
            updateCreatedWidgetLayouts,

            placed,
            setPlaced,
        }}>
            {children}
        </WidgetContext.Provider>
    )
}

export function useWidgetContext() {
    const ctx = useContext(WidgetContext)
    if(!ctx) throw new Error("NO CONTEXT FOUND, USE INSIDE WidgetProvider")
    return ctx
}
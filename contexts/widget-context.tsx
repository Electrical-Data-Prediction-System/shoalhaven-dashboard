"use client"

import { createContext, ReactNode, useContext, useRef, useState } from "react"
import { useLocalStorage } from "@/hooks/useLocalStorage"

export type WidgetFormConfig = {
    name: string
    type: "line" | "bar" | "pie" | "datatable"
    dataMode: "aggregate" | "readings"
    timePeriod: "5m" | "day" | "week" | "month" | "year"
    meterId: string
}

export type CreatedWidgetLayout = { x: number; y: number; w: number; h: number }
export type CreatedWidget = WidgetFormConfig & { id: string; layout?: CreatedWidgetLayout }

type GridPosition = { i: string; x: number; y: number; w: number; h: number }

type WidgetContextValue = {
    highlightedId: string | null
    highlight: (id : string) => void
    createdWidgets: CreatedWidget[]
    onCreateWidget: (config: WidgetFormConfig) => CreatedWidget
    updateCreatedWidget: (id: string, config: WidgetFormConfig) => void
    deleteCreatedWidget: (id: string) => void
    updateCreatedWidgetLayouts: (items: readonly GridPosition[]) => void
}

const WidgetContext = createContext<WidgetContextValue | null>(null)
const CREATED_WIDGETS_KEY = "dashboard.createdWidgets"

export function WidgetProvider({ children }: { children : ReactNode})
{
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
            deleteCreatedWidget,
            updateCreatedWidgetLayouts,
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
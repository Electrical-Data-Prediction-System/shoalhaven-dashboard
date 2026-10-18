"use client"

import { createContext, ReactNode, useContext, useRef, useState } from "react"

type WidgetContextValue = {
    highlightedId: string | null
    highlight: (id : string) => void
}

const WidgetContext = createContext<WidgetContextValue | null>(null)

export function WidgetProvider({ children }: { children : ReactNode})
{
    const [highlightedId, setHighlightedId] = useState<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const highlight = (id: string) => {
        if(timeoutRef.current) clearTimeout(timeoutRef.current)
        setHighlightedId(id)
        timeoutRef.current = setTimeout(() => setHighlightedId(null), 2000)
        console.log("highlight", id)
    }

    return (
        <WidgetContext.Provider value={{highlightedId, highlight}}>
            {children}
        </WidgetContext.Provider>
    )
}

export function useWidgetContext() {
    const ctx = useContext(WidgetContext)
    if(!ctx) throw new Error("NO CONTEXT FOUND, USE INSIDE WidgetProvider")
    return ctx
}
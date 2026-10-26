"use client"

import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import type { PlacedWidget } from "@/components/widget/types"
import { MARKET_SOURCE } from "@/lib/market"
import { SeasonSelect, useSeason } from "./season-select"

/**
 * Shared layout for every market widget: caption + season filter on top,
 * the widget's content in the middle, the data source underneath.
 * The content is a function of the chosen months, so each widget only handles fetching and drawing.
 */
export function MarketFrame({
  widget,
  caption,
  children,
}: {
  widget: PlacedWidget
  caption?: string
  children: (months: number[] | undefined) => ReactNode
}) {
  const { season, months, setSeason } = useSeason(widget)

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground" title={caption}>{caption}</p>
        <SeasonSelect value={season} onChange={setSeason} />
      </div>
      <div className="min-h-0 flex-1">{children(months)}</div>
      <p className="truncate text-[11px] text-muted-foreground">{MARKET_SOURCE}</p>
    </div>
  )
}

/** Loading skeleton or error message while a market widget's data isn't ready */
export function LoadState({ error, isLoading }: { error?: Error; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error) return <p className="text-sm text-destructive">Failed to load: {error.message}</p>
  return null
}

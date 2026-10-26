"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWidgetContext } from "@/contexts/widget-context"
import type { PlacedWidget } from "@/components/widget/types"
import { SEASONS, toSeason, type Season } from "@/lib/market"

/** The widget's season, saved with its layout so each copy keeps its own filter */
export function useSeason(widget: PlacedWidget) {
  const { updatePlacedOptions } = useWidgetContext()
  const season = toSeason(widget.options?.season)

  return {
    season,
    months: SEASONS[season].months,
    setSeason: (next: Season) => updatePlacedOptions(widget.id, { season: next }),
  }
}

export function SeasonSelect({ value, onChange }: { value: Season; onChange: (season: Season) => void }) {
  const items = Object.entries(SEASONS).map(([key, { label }]) => ({ value: key, label }))

  return (
    <Select items={items} value={value} onValueChange={(next) => next && onChange(toSeason(next))}>
      <SelectTrigger aria-label="Season" size="sm" className="text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map(({ value: key, label }) => (
          <SelectItem key={key} value={key}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

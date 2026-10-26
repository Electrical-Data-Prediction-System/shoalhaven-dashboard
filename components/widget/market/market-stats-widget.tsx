"use client"

import type { PlacedWidget } from "@/components/widget/types"
import { useApiData } from "@/hooks/use-ApiData"
import { GetMarketStats } from "@/lib/api"
import { formatPrice } from "@/lib/market"
import { LoadState, MarketFrame } from "./market-frame"

/** One headline number with a label above and an explanation below */
function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="flex min-w-36 flex-1 flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{detail}</span>
    </div>
  )
}

function MarketStatsContent({ months }: { months?: number[] }) {
  const { data, error, isLoading } = useApiData(() => GetMarketStats(months), [months?.join()])
  if (!data) return <LoadState error={error} isLoading={isLoading} />

  return (
    <div className="flex h-full flex-wrap content-start gap-x-6 gap-y-3">
      <StatTile
        label="Negative prices"
        value={data.negativeShare === null ? "–" : `${data.negativeShare}%`}
        detail="of half hours, when exporting costs money"
      />
      <StatTile
        label="Midday vs evening"
        value={data.middayAverage === null || data.eveningAverage === null
          ? "–"
          : `$${Math.round(data.middayAverage)} vs $${Math.round(data.eveningAverage)}`}
        detail="average $/MWh, 10am–3pm vs 5–9pm"
      />
      <StatTile
        label="Highest price"
        value={data.max === null ? "–" : formatPrice(data.max)}
        detail={`average ${data.average === null ? "–" : formatPrice(data.average)}`}
      />
    </div>
  )
}

/** Headline NSW spot price numbers for the chosen season */
export function MarketStatsWidget({ widget }: { widget: PlacedWidget }) {
  return (
    <MarketFrame widget={widget} caption="NSW spot price, 2025">
      {(months) => <MarketStatsContent months={months} />}
    </MarketFrame>
  )
}

"use client"

import { CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PlacedWidget } from "@/features/dashboard/widgets/types"
import { useApiData } from "@/hooks/use-ApiData"
import { GetMarketSeries } from "@/lib/api"
import { formatNemDate, formatPrice, MARKET_COLORS } from "@/lib/market"
import { LoadState, MarketFrame } from "./market-frame"

const priceConfig = {
  price: { label: "Daily average", color: MARKET_COLORS.price },
} satisfies ChartConfig

function MarketPriceContent({ months }: { months?: number[] }) {
  const { data, error, isLoading } = useApiData(() => GetMarketSeries(["price"], "day", months), [months?.join()])
  if (!data) return <LoadState error={error} isLoading={isLoading} />

  return (
    <ChartContainer config={priceConfig} className="h-full w-full aspect-auto">
      <ComposedChart data={data} accessibilityLayer margin={{ top: 8, right: 8, bottom: 0, left: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          minTickGap={32}
          tickFormatter={(value) => formatNemDate(String(value), { month: "short" })}
        />
        <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value) => `$${value}`} />
        {/* Below this line, selling to the grid costs money */}
        <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => formatNemDate(String(payload?.[0]?.payload?.date), { day: "numeric", month: "short", year: "numeric" })}
              formatter={(value) => `${formatPrice(Number(value))} average`}
            />
          }
        />
        <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={false} isAnimationActive={false} />
      </ComposedChart>
    </ChartContainer>
  )
}

/** Daily average NSW spot price across 2025, or one season of it */
export function MarketPriceWidget({ widget }: { widget: PlacedWidget }) {
  return (
    <MarketFrame widget={widget} caption="Daily average NSW spot price ($/MWh)">
      {(months) => <MarketPriceContent months={months} />}
    </MarketFrame>
  )
}

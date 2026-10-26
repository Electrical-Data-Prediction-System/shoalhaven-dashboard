"use client"

import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { PlacedWidget } from "@/features/dashboard/widgets/types"
import { useApiData } from "@/hooks/use-ApiData"
import { GetMarketDailyProfile } from "@/lib/api"
import { formatPrice, MARKET_COLORS, MARKET_LABELS } from "@/lib/market"
import { LoadState, MarketFrame } from "./market-frame"

const priceConfig = {
  price: { label: MARKET_LABELS.price, color: MARKET_COLORS.price },
} satisfies ChartConfig

// Real NSW totals: every rooftop system (AEMO's estimate) and every solar farm in the region
const solarConfig = {
  solar_rooftop: { label: MARKET_LABELS.solar_rooftop, color: MARKET_COLORS.solar_rooftop },
  solar_utility: { label: MARKET_LABELS.solar_utility, color: MARKET_COLORS.solar_utility },
} satisfies ChartConfig

/** Clock time "13:30" as a short axis label, e.g. "1:30pm" */
function formatClock(time: string) {
  const [hours, minutes] = time.split(":").map(Number)
  const suffix = hours < 12 ? "am" : "pm"
  const hour = hours % 12 || 12
  return minutes ? `${hour}:${String(minutes).padStart(2, "0")}${suffix}` : `${hour}${suffix}`
}

function DuckCurveContent({ months, syncId }: { months?: number[]; syncId: string }) {
  const { data, error, isLoading } = useApiData(
    () => GetMarketDailyProfile(["price", "solar_rooftop", "solar_utility"], months),
    [months?.join()],
  )
  if (!data) return <LoadState error={error} isLoading={isLoading} />

  const xAxis = (
    <XAxis
      dataKey="time"
      tickLine={false}
      axisLine={false}
      interval={5}
      tickFormatter={(value) => formatClock(String(value))}
    />
  )
  const tooltipLabel = (_: unknown, payload?: readonly { payload?: { time?: string } }[]) =>
    `Around ${formatClock(String(payload?.[0]?.payload?.time))}`

  // Two charts on one time axis rather than one chart with two y-scales.
  // The shared syncId moves both tooltips together when hovering either chart.
  return (
    <div className="grid h-full grid-rows-2 gap-1">
      <div className="flex min-h-0 flex-col">
        <span className="text-xs font-medium">Average spot price ($/MWh)</span>
        <ChartContainer config={priceConfig} className="min-h-0 w-full flex-1 aspect-auto">
          <ComposedChart data={data} syncId={syncId} accessibilityLayer margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} />
            {xAxis}
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value) => `$${value}`} />
            <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
            <ChartTooltip content={<ChartTooltipContent labelFormatter={tooltipLabel} formatter={(value) => formatPrice(Number(value))} />} />
            <Line dataKey="price" type="monotone" stroke="var(--color-price)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ChartContainer>
      </div>
      <div className="flex min-h-0 flex-col">
        <span className="text-xs font-medium">Average NSW solar output (MW)</span>
        <ChartContainer config={solarConfig} className="min-h-0 w-full flex-1 aspect-auto">
          <ComposedChart data={data} syncId={syncId} accessibilityLayer margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
            <CartesianGrid vertical={false} />
            {xAxis}
            <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value) => Number(value).toLocaleString()} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={tooltipLabel}
                  formatter={(value, name) => `${MARKET_LABELS[name as "solar_rooftop"] ?? name}: ${Math.round(Number(value)).toLocaleString()} MW`}
                />
              }
            />
            {/* Stacked, so the top edge is total NSW solar. A card-coloured stroke leaves a thin gap between the fills */}
            <Area dataKey="solar_utility" stackId="solar" type="monotone" fill="var(--color-solar_utility)" fillOpacity={0.85} stroke="var(--card)" strokeWidth={2} isAnimationActive={false} />
            <Area dataKey="solar_rooftop" stackId="solar" type="monotone" fill="var(--color-solar_rooftop)" fillOpacity={0.85} stroke="var(--card)" strokeWidth={2} isAnimationActive={false} />
          </ComposedChart>
        </ChartContainer>
        {/* Drawn by hand: Recharts takes swatch colours from the stroke, which is the card colour here */}
        <div className="flex justify-center gap-4 text-xs">
          {Object.entries(solarConfig).map(([key, { label, color }]) => (
            <span key={key} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-[2px]" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Average price and NSW solar output for each half hour of the day (the "duck curve") */
export function DuckCurveWidget({ widget }: { widget: PlacedWidget }) {
  return (
    <MarketFrame widget={widget} caption="Average day: prices drop when solar peaks">
      {(months) => <DuckCurveContent months={months} syncId={`duck-${widget.id}`} />}
    </MarketFrame>
  )
}

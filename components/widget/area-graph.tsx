"use client"

import { useId } from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { WidgetFormConfig } from "@/contexts/widget-context"
import type { ForecastChartRow } from "@/lib/chart-data"
import { complementColor, formatChartDate, formatSeriesValue } from "@/lib/chart-format"

/** Above this many points, dots and animation make resizing sluggish */
const MAX_DOTTED_POINTS = 60

export function AreaGraph({
  data,
  unit = "kWh",
  color = "#217acc",
  dataMode,
  timePeriod,
  forecastStart,
}: {
  data: ForecastChartRow[]
  unit?: string
  color?: string
  dataMode: WidgetFormConfig["dataMode"]
  timePeriod: WidgetFormConfig["timePeriod"]
  /** x value where actual data ends and the forecast begins */
  forecastStart?: string
}) {
  const chartConfig = {
    kwh: { label: unit === "AUD" ? "Estimated cost" : "KWH", color },
    forecast: { label: "Forecast", color: complementColor(color) },
    band: { label: "Likely range", color: complementColor(color) },
  } satisfies ChartConfig
  const gradientId = useId().replaceAll(":", "")

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <ComposedChart data={data} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-kwh)" stopOpacity={0.45} />
            <stop offset="95%" stopColor="var(--color-kwh)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          interval="preserveStartEnd"
          tickFormatter={(value) => formatChartDate(String(value), dataMode, timePeriod)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatChartDate(String(value), dataMode, timePeriod)}
              formatter={(value, name) => formatSeriesValue(value, name, unit)}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {forecastStart && (
          <Area
            dataKey="band"
            type="monotone"
            stroke="none"
            fill="var(--color-band)"
            fillOpacity={0.15}
            activeDot={false}
            legendType="square"
          />
        )}
        {forecastStart && (
          <Line
            dataKey="forecast"
            type="monotone"
            stroke="var(--color-forecast)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
          />
        )}
        {forecastStart && (
          <ReferenceLine
            x={forecastStart}
            stroke="var(--muted-foreground)"
            strokeDasharray="3 3"
            label={{ value: "Forecast →", position: "insideTopLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
          />
        )}
        <Area
          dataKey="kwh"
          type="monotone"
          stroke="var(--color-kwh)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={data.length <= MAX_DOTTED_POINTS && { r: 3, fill: "var(--color-kwh)" }}
          activeDot={{ r: 5 }}
          isAnimationActive={data.length <= MAX_DOTTED_POINTS}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

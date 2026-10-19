"use client"

import { useId } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import type { ChartRow } from "@/lib/chart-data"
import { formatChartDate, formatChartValue } from "@/lib/chart-format"

export function AreaGraph({
  data,
  unit = "kWh",
  color = "#217acc",
  dataMode,
  timePeriod,
}: {
  data: ChartRow[]
  unit?: string
  color?: string
  dataMode: WidgetFormConfig["dataMode"]
  timePeriod: WidgetFormConfig["timePeriod"]
}) {
  const chartConfig = {
    kwh: { label: unit === "AUD" ? "Estimated cost" : "KWH", color },
  } satisfies ChartConfig
  const gradientId = useId().replaceAll(":", "")

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <AreaChart data={data} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
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
              formatter={(value) => unit === "AUD"
                ? [formatChartValue(Number(value), unit), ""]
                : [formatChartValue(Number(value), unit ?? "kWh"), unit ?? "kWh"]}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          dataKey="kwh"
          type="monotone"
          stroke="var(--color-kwh)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: "var(--color-kwh)" }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}

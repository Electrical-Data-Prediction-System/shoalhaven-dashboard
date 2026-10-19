"use client"

import {
  CartesianGrid,
  Line,
  LineChart,
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
import type { ChartRow } from "@/lib/chart-data"
import { formatChartDate, formatChartValue } from "@/lib/chart-format"
import type { WidgetFormConfig } from "@/contexts/widget-context";

export function LineGraph({
  data,
  unit,
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

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <LineChart data={data} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
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
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} />
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
        <Line
          dataKey="kwh"
          type="monotone"
          stroke="var(--color-kwh)"
          strokeWidth={2}
          dot={{ r: 3, fill: "var(--color-kwh)" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}

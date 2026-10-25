import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { CHART_SERIES_COLORS, toMultiSeriesChartData, type ChartRow } from "@/lib/chart-data"
import { formatChartDate, formatChartValue } from "@/lib/chart-format"
import type { WidgetFormConfig } from "@/contexts/widget-context"

export function BarGraph({
  data,
  unit = "kWh",
  seriesColors = {},
  dataMode,
  timePeriod,
}: {
  data: ChartRow[]
  unit?: string
  seriesColors?: Record<string, string>
  dataMode?: WidgetFormConfig["dataMode"]
  timePeriod?: WidgetFormConfig["timePeriod"]
}) {
  const { data: chartData, series } = toMultiSeriesChartData(data)
  const chartConfig: ChartConfig = Object.fromEntries(series.map(({ key, name }, index) => [
    key,
    {
      label: name === "kwh" ? (unit === "AUD" ? "Estimated cost" : "KWH") : name,
      color: seriesColors[name] ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
    },
  ]))

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <BarChart data={chartData} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          interval="preserveStartEnd"
              tickFormatter={(value) =>
            dataMode && timePeriod
              ? formatChartDate(String(value), dataMode, timePeriod)
              : String(value)
          }
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                dataMode && timePeriod
                  ? formatChartDate(String(value), dataMode, timePeriod)
                  : String(value)
              }
              formatter={(value) => unit === "AUD"
                ? [formatChartValue(Number(value), unit), ""]
                : [formatChartValue(Number(value), unit ?? " kWh"), unit ?? " kWh"]}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map(({ key, name }, index) => (
          <Bar
            key={key}
            dataKey={key}
            name={name}
            fill={seriesColors[name] ?? CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]}
            radius={4}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}

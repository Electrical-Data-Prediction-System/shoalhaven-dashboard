"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { formatChartDate } from "@/features/dashboard/lib/chart-format"
import { type GraphProps, getChartData, getChartConfig, getSeriesColor, formatAxisDate, formatTooltipValue} from "./graph-common"

export function AreaGraph({ data, unit = "kWh", seriesColors = {}, dataMode, timePeriod}: GraphProps) {

  const { data: chartData, series } = getChartData(data)
  const chartConfig = getChartConfig(series, unit, seriesColors)

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <AreaChart data={chartData} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          interval="preserveStartEnd"
          tickFormatter={(value) => formatChartDate(value, dataMode, timePeriod)}
        />

        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => formatAxisDate(value, dataMode, timePeriod)}
              formatter={(value) => formatTooltipValue(value, unit)}
            />
          }
        />

        <ChartLegend content={<ChartLegendContent />} />

        {series.map(({ key, name }, index) => {
          const fill = getSeriesColor(name, index, seriesColors)

          return (
          <Area
            key={key}
            dataKey={key}
            name={name}
            type="monotone"
            stroke={fill}
            strokeWidth={2}
            fill={fill}
            fillOpacity={0.08}
            dot={{ r: 3, fill }}
            activeDot={{ r: 5 }}
          />
          )
        })}
      </AreaChart>
    </ChartContainer>
  )
}

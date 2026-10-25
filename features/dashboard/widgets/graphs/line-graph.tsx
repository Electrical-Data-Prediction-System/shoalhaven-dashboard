"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { type GraphProps, getChartData, getChartConfig, getSeriesColor, formatAxisDate, formatTooltipValue} from "./graph-common"

export function LineGraph({ data, unit, seriesColors = {}, dataMode, timePeriod}: GraphProps) {
  const { data: chartData, series } = getChartData(data)
  const chartConfig = getChartConfig(series, unit, seriesColors)

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <LineChart data={chartData} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} />

        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={28}
          interval="preserveStartEnd"
          tickFormatter={(value) => formatAxisDate(value, dataMode, timePeriod)}
        />

        <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} />

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
          const color = getSeriesColor(name, index, seriesColors)

          return (
          <Line
            key={key}
            dataKey={key}
            name={name}
            type="monotone"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
          )
        })}

      </LineChart>
    </ChartContainer>
  )
}

"use client"

import { Area, CartesianGrid, ComposedChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { formatChartDate, formatSeriesValue } from "@/features/dashboard/lib/chart-format"
import { type GraphProps, MAX_DOTTED_POINTS, getChartData, getChartConfig, getSeriesColor, formatAxisDate} from "./graph-common"
import { forecastConfig, forecastLayers, withForecast } from "./forecast-layers"

export function AreaGraph({ data, unit = "kWh", seriesColors = {}, dataMode, timePeriod, forecast}: GraphProps) {

  const { data: actualData, series } = getChartData(data)
  const { data: chartData, forecastStart } = withForecast(actualData, series, forecast)
  const chartConfig = {
    ...getChartConfig(series, unit, seriesColors),
    ...(forecastStart ? forecastConfig(getSeriesColor(series[0].name, 0, seriesColors)) : {}),
  }
  const showDots = chartData.length <= MAX_DOTTED_POINTS

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <ComposedChart data={chartData} accessibilityLayer margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
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
              formatter={(value, name) => formatSeriesValue(value, name, unit)}
            />
          }
        />

        <ChartLegend content={<ChartLegendContent />} />

        {forecastLayers(forecastStart)}

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
            dot={showDots && { r: 3, fill }}
            activeDot={{ r: 5 }}
            isAnimationActive={showDots}
          />
          )
        })}
      </ComposedChart>
    </ChartContainer>
  )
}

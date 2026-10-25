import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import { type GraphProps, getChartData, getChartConfig, getSeriesColor, formatAxisDate, formatTooltipValue} from "./graph-common"

export function BarGraph({ data, unit = "kWh", seriesColors = {}, dataMode, timePeriod}: GraphProps) {
  const { data: chartData, series } = getChartData(data)
  const chartConfig = getChartConfig(series, unit, seriesColors)

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
          tickFormatter={(value) => formatAxisDate(value, dataMode, timePeriod)}
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

        {series.map(({ key, name }, index) => (
          <Bar
            key={key}
            dataKey={key}
            name={name}
            fill={getSeriesColor(name, index, seriesColors)}
            radius={4}
          />
        ))}

      </BarChart>
    </ChartContainer>
  )
}

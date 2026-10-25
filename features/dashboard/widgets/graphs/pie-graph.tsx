import { useMemo } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig} from "@/components/ui/chart"
import { toMultiSeriesChartData} from "@/lib/chart-data"
import { formatChartDate } from "@/features/dashboard/lib/chart-format"
import { type GraphProps, formatTooltipValue } from "./graph-common"

const COLORS = [
  "var(--color-brand-primary-300)",
  "var(--color-brand-secondary-700)",
  "var(--color-brand-secondary-500)",
  "var(--color-brand-warning-500)",
  "var(--color-brand-warning-700)",
  "var(--color-brand-primary-500)",
  "var(--color-brand-secondary-300)",
  "var(--color-brand-warning-300)",
]

export function PieGraph({data,unit = "kWh", dataMode, timePeriod}: GraphProps) {
  const chartConfig = {
    value: { 
      label: unit === "AUD" ? "Estimated cost" : "KWH", 
      color: "var(--color-brand-secondary-700)" },
  } satisfies ChartConfig
  
  const pieData = useMemo(() => {
    const { series } = toMultiSeriesChartData(data)

    if (series.length > 1) {
      return series.map(({ name }) => ({
        name,
        value: data
          .filter((row) => row.series === name)
          .reduce((sum, row) => sum + row.kwh, 0),
      })).sort((a, b) => b.value - a.value)
    }

    const grouped = new Map<string, number>()

    for (const row of data) {
      const label = formatChartDate(row.x, dataMode, timePeriod)
      grouped.set(label, (grouped.get(label) ?? 0) + row.kwh)
    }

    const sorted = [...grouped]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    if (sorted.length <= 8) return sorted

    return [
      ...sorted.slice(0, 7),
      {
        name: "Other",
        value: sorted
          .slice(7)
          .reduce((sum, entry) => sum + entry.value, 0),
      },
    ]
  }, [data, dataMode, timePeriod])

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <PieChart accessibilityLayer>
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => String(payload[0]?.name ?? "")}
              formatter={(value) => formatTooltipValue(value, unit)}
            />
          }
        />

        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={44} outerRadius={80} paddingAngle={2}>

          {pieData.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
          ))}

        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

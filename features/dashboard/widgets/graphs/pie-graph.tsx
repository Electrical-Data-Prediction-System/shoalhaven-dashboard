import { useMemo } from "react"
import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig} from "@/components/ui/chart"
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
    const seriesTotals = new Map<string, number>()
    const dateTotals = new Map<string, number>()
    const labelsByDate = new Map<string, string>()

    for (const row of data) {
      const seriesName = row.series ?? "kwh"
      seriesTotals.set(
        seriesName,
        (seriesTotals.get(seriesName) ?? 0) + row.kwh,
      )

      let label = labelsByDate.get(row.x)
      if (label === undefined) {
        label = formatChartDate(row.x, dataMode, timePeriod)
        labelsByDate.set(row.x, label)
      }
      dateTotals.set(label, (dateTotals.get(label) ?? 0) + row.kwh)
    }

    const totals = seriesTotals.size > 1 ? seriesTotals : dateTotals
    const sorted = [...totals]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    if (sorted.length <= 8) return sorted

    return [
      ...sorted.slice(0, 7),
      {
        name: "Other",
        value: sorted.slice(7).reduce((sum, entry) => sum + entry.value, 0),
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

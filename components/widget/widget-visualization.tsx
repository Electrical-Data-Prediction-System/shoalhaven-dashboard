import { BarGraph } from "./bar-graph"
import { LineGraph } from "./line-graph"
import { AreaGraph } from "./area-graph"
import { PieGraph } from "./pie-graph"
import type { CreatedWidget } from "@/contexts/widget-context"
import type { ChartRow } from "@/lib/chart-data"

export function WidgetVisualization({
  widget,
  data,
  unit = "kWh",
  seriesColor,
}: {
  widget: CreatedWidget
  data: ChartRow[]
  unit?: string
  seriesColor?: string
}) {
  if (widget.type === "line") {
    return <LineGraph data={data} unit={unit} color={seriesColor} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "area") {
    return <AreaGraph data={data} unit={unit} color={seriesColor} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "bar") {
    return <BarGraph data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "pie") {
    return <PieGraph data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }

  return (
    <div className="h-full overflow-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2 font-medium">Time</th>
            <th className="p-2 text-right font-medium">{unit === "AUD" ? "Cost" : "KWH"}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.x} className="border-b last:border-0">
              <td className="p-2">{point.x}</td>
              <td className="p-2 text-right">
                {unit === "AUD" ? new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(point.kwh) : point.kwh}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

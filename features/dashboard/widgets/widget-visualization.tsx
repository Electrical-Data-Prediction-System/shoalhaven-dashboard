import { BarGraph } from "./graphs/bar-graph"
import { LineGraph } from "./graphs/line-graph"
import { AreaGraph } from "./graphs/area-graph"
import { PieGraph } from "./graphs/pie-graph"
import { DataTable } from "./data-table"
import type { CreatedWidget } from "@/features/dashboard/context/widget-context"
import type { ChartRow } from "@/lib/chart-data"

export function WidgetVisualization({
  widget,
  data,
  unit = "kWh",
  seriesColors,
}: {
  widget: CreatedWidget
  data: ChartRow[]
  unit?: string
  seriesColors?: Record<string, string>
}) {
  if (widget.type === "line") {
    return <LineGraph data={data} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "area") {
    return <AreaGraph data={data} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "bar") {
    return <BarGraph data={data} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "pie") {
    return <PieGraph data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }

  return <DataTable data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
}

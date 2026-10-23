import { BarGraph } from "./bar-graph"
import { LineGraph } from "./line-graph"
import { AreaGraph } from "./area-graph"
import { PieGraph } from "./pie-graph"
import { DataTable } from "./data-table"
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

  return <DataTable data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
}

import { BarGraph } from "./graphs/bar-graph"
import { LineGraph } from "./graphs/line-graph"
import { AreaGraph } from "./graphs/area-graph"
import { PieGraph } from "./graphs/pie-graph"
import { DataTable } from "./data-table"
import type { CreatedWidget } from "@/features/dashboard/context/widget-context"
import { downsampleRows, readingIntervalMinutes, type ChartRow } from "@/lib/chart-data"
import type { ApiForecast } from "@/lib/api"

export function WidgetVisualization({
  widget,
  data,
  unit = "kWh",
  seriesColors,
  forecast,
}: {
  widget: CreatedWidget
  data: ChartRow[]
  unit?: string
  seriesColors?: Record<string, string>
  forecast?: ApiForecast | null
}) {
  // Thousands of raw readings are too many to draw, so plot a shape-preserving sample
  const plotted = downsampleRows(data)
  // The hourly forecast is kWh per hour, but each raw reading only covers its own interval
  const interval = widget.dataMode === "readings" && forecast?.granularity === "hour"
    ? readingIntervalMinutes(data)
    : null
  // Forecasts are in kWh, so they're only drawn on the energy view
  const graphForecast = forecast && unit !== "AUD"
    ? { points: forecast.points, scale: interval ? interval / 60 : 1 }
    : undefined

  if (widget.type === "line") {
    return <LineGraph data={plotted} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} forecast={graphForecast} />
  }
  if (widget.type === "area") {
    return <AreaGraph data={plotted} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} forecast={graphForecast} />
  }
  if (widget.type === "bar") {
    return <BarGraph data={plotted} unit={unit} seriesColors={seriesColors} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "pie") {
    return <PieGraph data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }

  return <DataTable data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
}

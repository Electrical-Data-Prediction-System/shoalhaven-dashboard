import { BarGraph } from "./bar-graph"
import { LineGraph } from "./line-graph"
import { AreaGraph } from "./area-graph"
import { PieGraph } from "./pie-graph"
import { DataTable } from "./data-table"
import type { CreatedWidget } from "@/contexts/widget-context"
import { downsample, mergeForecast, readingIntervalMinutes, type ChartRow } from "@/lib/chart-data"
import type { ApiForecast } from "@/lib/api"

export function WidgetVisualization({
  widget,
  data,
  unit = "kWh",
  seriesColor,
  forecast,
}: {
  widget: CreatedWidget
  data: ChartRow[]
  unit?: string
  seriesColor?: string
  forecast?: ApiForecast | null
}) {
  // Thousands of raw readings are too many to draw, so plot a shape-preserving sample
  const plotted = downsample(data)
  // The hourly forecast is kWh per hour, but each raw reading only covers its own interval
  const interval = widget.dataMode === "readings" && forecast?.granularity === "hour"
    ? readingIntervalMinutes(data)
    : null
  const scale = interval ? interval / 60 : 1
  // Forecasts are in kWh, so they're only drawn on the energy view
  const rows = forecast && unit !== "AUD" ? mergeForecast(plotted, forecast.points, scale) : plotted
  const forecastStart = rows.length > plotted.length ? plotted[plotted.length - 1].x : undefined

  if (widget.type === "line") {
    return <LineGraph data={rows} unit={unit} color={seriesColor} dataMode={widget.dataMode} timePeriod={widget.timePeriod} forecastStart={forecastStart} />
  }
  if (widget.type === "area") {
    return <AreaGraph data={rows} unit={unit} color={seriesColor} dataMode={widget.dataMode} timePeriod={widget.timePeriod} forecastStart={forecastStart} />
  }
  if (widget.type === "bar") {
    return <BarGraph data={plotted} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }
  if (widget.type === "pie") {
    return <PieGraph data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
  }

  return <DataTable data={data} unit={unit} dataMode={widget.dataMode} timePeriod={widget.timePeriod} />
}

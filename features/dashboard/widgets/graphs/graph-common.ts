
import type { WidgetFormConfig } from "../../context/widget-context"
import {
  CHART_SERIES_COLORS,
  toMultiSeriesChartData,
  type ChartRow,
} from "@/lib/chart-data"
import { formatChartDate, formatChartValue } from "../../lib/chart-format"
import type { ChartConfig } from "@/components/ui/chart"
import type { GraphForecast } from "./forecast-layers"

/** Above this many points, dots and animation make resizing sluggish */
export const MAX_DOTTED_POINTS = 60

export type GraphProps = {
  data: ChartRow[]
  unit?: string
  seriesColors?: Record<string, string>
  dataMode: WidgetFormConfig["dataMode"]
  timePeriod: WidgetFormConfig["timePeriod"]
  /** Drawn after the actual data on single-meter line and area charts */
  forecast?: GraphForecast
  /** Alert limits drawn as dashed lines on single-meter daily charts */
  limits?: { lower?: number; upper?: number }
}

export function getChartData(data: ChartRow[]) {
  return toMultiSeriesChartData(data)
}

export function getSeriesColor(
  name: string,
  index: number,
  seriesColors: Record<string, string> = {},
) {
  return (
    seriesColors[name] ??
    CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length]
  )
}

export function getChartConfig(
  series: { key: string; name: string }[],
  unit = "kWh",
  seriesColors: Record<string, string> = {},
): ChartConfig {
  return Object.fromEntries(
    series.map(({ key, name }, index) => [
      key,
      {
        label:
          name === "kwh"
            ? unit === "AUD"
              ? "Estimated cost"
              : "KWH"
            : name,
        color: getSeriesColor(name, index, seriesColors),
      },
    ]),
  )
}

export function formatAxisDate(
  value: unknown,
  dataMode?: GraphProps["dataMode"],
  timePeriod?: GraphProps["timePeriod"],
) {
  if (!dataMode || !timePeriod) {
    return String(value)
  }

  return formatChartDate(String(value), dataMode, timePeriod)
}

export function formatTooltipValue(value: unknown, unit = "kWh") {
  const formatted = formatChartValue(Number(value), unit)

  return unit === "AUD"
    ? [formatted, ""] as [string, string]
    : [formatted, unit] as [string, string]
}

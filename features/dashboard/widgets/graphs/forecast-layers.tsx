import { Area, Line, ReferenceLine } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import { complementColor } from "@/features/dashboard/lib/chart-format"
import { mergeForecast, type ForecastPoint } from "@/lib/chart-data"

/** Forecast points plus the factor that converts them to the chart's unit (e.g. 0.5 for half-hourly readings) */
export type GraphForecast = { points: ForecastPoint[]; scale: number }

/**
 * Appends forecast rows after the actual data. Forecasts are per meter,
 * so charts with more than one series are returned unchanged.
 */
export function withForecast<T extends { x: string }>(
  data: T[],
  series: { key: string }[],
  forecast?: GraphForecast,
) {
  if (!forecast || series.length !== 1 || !data.length) return { data, forecastStart: undefined }

  const merged = mergeForecast(data, forecast.points, forecast.scale, series[0].key)
  return { data: merged, forecastStart: merged.length > data.length ? data[data.length - 1].x : undefined }
}

/** Legend and tooltip entries for the forecast, in the opposite hue to the meter's colour */
export function forecastConfig(seriesColor: string): ChartConfig {
  const color = complementColor(seriesColor)
  return {
    forecast: { label: "Forecast", color },
    band: { label: "Likely range", color },
  }
}

/** Shaded p10-p90 band, dashed p50 line and a marker where the forecast starts */
export function forecastLayers(forecastStart?: string) {
  if (!forecastStart) return null

  return [
    <Area
      key="forecast-band"
      dataKey="band"
      type="monotone"
      stroke="none"
      fill="var(--color-band)"
      fillOpacity={0.15}
      activeDot={false}
      legendType="square"
      isAnimationActive={false}
    />,
    <Line
      key="forecast-line"
      dataKey="forecast"
      type="monotone"
      stroke="var(--color-forecast)"
      strokeWidth={2}
      strokeDasharray="5 4"
      dot={false}
      isAnimationActive={false}
    />,
    <ReferenceLine
      key="forecast-start"
      x={forecastStart}
      stroke="var(--muted-foreground)"
      strokeDasharray="3 3"
      label={{ value: "Forecast →", position: "insideTopLeft", fontSize: 11, fill: "var(--muted-foreground)" }}
    />,
  ]
}

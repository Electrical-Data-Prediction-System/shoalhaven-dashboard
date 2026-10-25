import {
  ApiError,
  GetAggregatedMeterPower,
  GetLatestReadingTimestamp,
  GetMeterForecast,
  GetReadingsBetween,
  type ApiForecast,
  type ForecastGranularity,
} from "@/lib/api"
import type { WidgetFormConfig } from "@/contexts/widget-context"
import { toChartRows, type ChartRow } from "@/lib/chart-data"

function getStartDate(period: WidgetFormConfig["timePeriod"], end: Date) {
  const start = new Date(end)

  switch (period) {
    case "5m":
      start.setMinutes(start.getMinutes() - 5)
      break
    case "day":
      start.setDate(start.getDate() - 1)
      break
    case "week":
      start.setDate(start.getDate() - 7)
      break
    case "month":
      start.setMonth(start.getMonth() - 1)
      break
    case "year":
      start.setFullYear(start.getFullYear() - 1)
      break
  }

  return start
}

export async function loadWidgetData(config: WidgetFormConfig): Promise<ChartRow[]> {
  if (config.dataMode === "aggregate") {
    const response = await GetAggregatedMeterPower(config.meterId, undefined, undefined, config.timePeriod)
    return toChartRows(response)
  }

  const latestTimestamp = await GetLatestReadingTimestamp(config.meterId)
  if (!latestTimestamp) return []

  const end = new Date(latestTimestamp)
  const start = getStartDate(config.timePeriod, end)
  const readings = await GetReadingsBetween(config.meterId, start, end)
  return readings.map(({ timestamp, kwh }) => ({ x: timestamp, kwh }))
}

/** Which saved forecast fits a chart: hourly for raw readings, daily for daily buckets */
export function forecastGranularity(config: Pick<WidgetFormConfig, "type" | "dataMode" | "timePeriod">): ForecastGranularity | null {
  if (config.type !== "line" && config.type !== "area") return null
  if (config.dataMode === "readings") return "hour"
  if (config.timePeriod === "day") return "day"
  return null
}

/** Loads the chart's forecast, or null when it's turned off or hasn't been generated */
export async function loadWidgetForecast(config: WidgetFormConfig): Promise<ApiForecast | null> {
  const granularity = forecastGranularity(config)
  if (!config.showForecast || !granularity) return null

  try {
    return await GetMeterForecast(config.meterId, granularity)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

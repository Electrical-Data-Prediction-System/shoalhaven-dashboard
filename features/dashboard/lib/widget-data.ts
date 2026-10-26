import {
  ApiError,
  GetAllAggregatedMeterPower,
  GetLatestReadingTimestamp,
  GetMeterForecast,
  type ApiForecast,
  type ForecastGranularity,
} from "@/lib/api"
import type { CreatedWidget, WidgetFormConfig } from "@/features/dashboard/context/widget-context"
import { toChartRows, type ChartRow } from "@/lib/chart-data"

const CACHE_TTL_MS = 60_000

const cache = new Map<string, { data: ChartRow[]; expiresAt: number }>()
const inFlight = new Map<string, Promise<ChartRow[]>>()


// Loaders 

export async function loadCachedWidgetData(config: WidgetFormConfig | CreatedWidget): Promise<ChartRow[]> {
  const key = getWidgetDataKey(config)
  const cached = cache.get(key)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data
  }

  const existingRequest = inFlight.get(key)
  if (existingRequest) return existingRequest

  const request = loadWidgetData(config)
    .then((data) => {
      cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
      return data
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, request)
  return request
}

export async function loadWidgetData(config: WidgetFormConfig | CreatedWidget): Promise<ChartRow[]> {
  const meterIds = getWidgetMeterIds(config)

  if (config.dataMode === "aggregate") {
    const interval = config.timePeriod === "latest" ? "month" : config.timePeriod
    const response = await GetAllAggregatedMeterPower(undefined, undefined, interval, meterIds)
    return toChartRows(response)
  }

  if (config.timePeriod === "latest") {
    const timestamps = await Promise.all(meterIds.map(GetLatestReadingTimestamp))
    const latestTimestamp = timestamps.reduce<Date | null>((latest, timestamp) => {
      if (!timestamp) return latest

      const date = new Date(timestamp)
      if (Number.isNaN(date.getTime())) {
        throw new TypeError(`Invalid latest reading timestamp: ${timestamp}`)
      }

      return latest && latest > date ? latest : date
    }, null)

    if (!latestTimestamp) return []

    const start = new Date(latestTimestamp.getTime() - 24 * 60 * 60 * 1000)
    const response = await GetAllAggregatedMeterPower(start, latestTimestamp, undefined, meterIds, true)
    return toChartRows(response)
  }

  const response = await GetAllAggregatedMeterPower(undefined, undefined, undefined, meterIds, true)
  return toChartRows(response)
}


// Forecasts

/** Which saved forecast fits a chart: hourly for raw readings, daily for daily buckets. Single meter only */
export function forecastGranularity(
  config: Pick<WidgetFormConfig, "type" | "dataMode" | "timePeriod"> & Pick<CreatedWidget, "meterIds" | "meterId">,
): ForecastGranularity | null {
  if (config.type !== "line" && config.type !== "area") return null
  if (getWidgetMeterIds(config).length !== 1) return null
  if (config.dataMode === "readings") return "hour"
  if (config.timePeriod === "day") return "day"
  return null
}

/** Loads the chart's forecast, or null when it's turned off, not applicable or not generated yet */
export async function loadWidgetForecast(config: WidgetFormConfig | CreatedWidget): Promise<ApiForecast | null> {
  const granularity = forecastGranularity(config)
  if (!config.showForecast || !granularity) return null

  try {
    return await GetMeterForecast(getWidgetMeterIds(config)[0], granularity)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}


// Helpers

export function getWidgetMeterIds(config: Pick<CreatedWidget, "meterIds" | "meterId">): string[] {
  if (config.meterIds?.length) return config.meterIds
  return config.meterId ? [config.meterId] : []
}

function getWidgetDataKey(config: WidgetFormConfig | CreatedWidget) {
  const meterIds = getWidgetMeterIds(config).slice().sort()

  return JSON.stringify({
    meterIds,
    dataMode: config.dataMode,
    timePeriod: config.timePeriod,
  })
}
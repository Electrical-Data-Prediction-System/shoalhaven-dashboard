import { GetAllAggregatedMeterPower } from "@/lib/api"
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
    const interval = config.timePeriod === "day" ? "month" : config.timePeriod
    const response = await GetAllAggregatedMeterPower(undefined, undefined, interval, meterIds)
    return toChartRows(response)
  }

  const response = await GetAllAggregatedMeterPower(undefined, undefined, undefined, meterIds, true)
  return toChartRows(response)
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
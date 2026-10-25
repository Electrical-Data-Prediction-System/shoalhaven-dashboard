import {
  GetAllAggregatedMeterPower,
} from "@/lib/api"
import type { CreatedWidget, WidgetFormConfig } from "@/contexts/widget-context"
import { toChartRows, type ChartRow } from "@/lib/chart-data"

export function getWidgetMeterIds(config: Pick<CreatedWidget, "meterIds" | "meterId">): string[] {
  if (config.meterIds?.length) return config.meterIds
  return config.meterId ? [config.meterId] : []
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

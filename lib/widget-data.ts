import { GetAggregatedMeterPower, GetLatestReadingTimestamp, GetReadingsBetween } from "@/lib/api"
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
    const interval = config.timePeriod === "day" ? "month" : config.timePeriod
    const response = await GetAggregatedMeterPower(config.meterId, undefined, undefined, interval)
    return toChartRows(response)
  }

  const latestTimestamp = await GetLatestReadingTimestamp(config.meterId)
  if (!latestTimestamp) return []

  const end = new Date(latestTimestamp)
  const start = getStartDate(config.timePeriod, end)
  const readings = await GetReadingsBetween(config.meterId, start, end)
  return readings.map(({ timestamp, kwh }) => ({ x: timestamp, kwh }))
}

import type { WidgetFormConfig } from "@/contexts/widget-context"

export function formatChartValue(value: number, unit: string) {
  if (unit === "AUD") {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(value)
  }
  return value.toLocaleString()
}

function parseChartDate(value: string, dataMode: WidgetFormConfig["dataMode"]) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (!match) return null

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match
  return dataMode === "aggregate"
    ? new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)
    : new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
}

export function formatTableDate(
  value: string,
  dataMode: WidgetFormConfig["dataMode"],
  timePeriod: WidgetFormConfig["timePeriod"],
) {
  const date = parseChartDate(value, dataMode)
  if (!date) return value

  const aggregateOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" },
    day: { day: "numeric", month: "short", year: "numeric" },
    week: { day: "numeric", month: "short", year: "numeric" },
    month: { month: "short", year: "numeric" },
    year: { year: "numeric" },
  }

  return new Intl.DateTimeFormat(undefined, {
    ...(dataMode === "aggregate"
      ? aggregateOptions[timePeriod]
      : { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }),
    timeZone: dataMode === "aggregate" ? "Australia/Sydney" : "UTC",
  }).format(date)
}

export function formatChartDate(
  value: string,
  dataMode: WidgetFormConfig["dataMode"],
  timePeriod: WidgetFormConfig["timePeriod"],
) {
  const date = parseChartDate(value, dataMode)
  if (!date) return value

  const aggregateOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
    day: { month: "short", day: "numeric" },
    week: { month: "short", day: "numeric" },
    month: { month: "short", year: "2-digit" },
    year: { year: "numeric" },
  }
  const rawOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { hour: "numeric", minute: "2-digit" },
    day: { weekday: "short", hour: "numeric" },
    week: { weekday: "short", hour: "numeric" },
    month: { month: "short", day: "numeric" },
    year: { month: "short", year: "2-digit" },
  }

  return new Intl.DateTimeFormat(undefined, {
    ...(dataMode === "aggregate" ? aggregateOptions[timePeriod] : rawOptions[timePeriod]),
    timeZone: dataMode === "aggregate" ? "Australia/Sydney" : "UTC",
  }).format(date)
}

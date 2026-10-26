import type { WidgetFormConfig } from "@/features/dashboard/context/widget-context"

export function formatChartValue(value: number, unit: string) {
  if (unit === "AUD") {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD" }).format(value)
  }
  return value.toLocaleString()
}

function parseChartDate(value: string) {
  const normalizedValue = value.trim().replace(" ", "T")
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/.test(normalizedValue)
    && !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedValue)) {
    return null
  }

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalizedValue)
  const normalizedPrecision = normalizedValue.replace(/\.(\d+)(?=(?:Z|[+-]\d{2}:?\d{2})?$)/, (_, fraction: string) =>
    `.${fraction.slice(0, 3)}`,
  )
  const date = new Date(hasTimezone ? normalizedPrecision : `${normalizedPrecision}Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatTableDate(
  value: string,
  dataMode: WidgetFormConfig["dataMode"],
  timePeriod: WidgetFormConfig["timePeriod"],
) {
  const date = parseChartDate(value)
  if (!date) return value

  const aggregateOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" },
    day: { day: "numeric", month: "short", year: "numeric" },
    latest: { day: "numeric", month: "short", year: "numeric" },
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
  const date = parseChartDate(value)
  if (!date) return value

  const aggregateOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" },
    day: { month: "short", day: "numeric" },
    latest: { month: "short", day: "numeric" },
    week: { month: "short", day: "numeric" },
    month: { month: "short", year: "2-digit" },
    year: { year: "numeric" },
  }
  const rawOptions: Record<WidgetFormConfig["timePeriod"], Intl.DateTimeFormatOptions> = {
    "5m": { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    day: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    latest: { hour: "2-digit", minute: "2-digit", hourCycle: "h23" },
    week: { weekday: "short", hour: "numeric" },
    month: { month: "short", day: "numeric" },
    year: { month: "short", year: "2-digit" },
  }

  return new Intl.DateTimeFormat(undefined, {
    ...(dataMode === "aggregate" ? aggregateOptions[timePeriod] : rawOptions[timePeriod]),
    timeZone: dataMode === "aggregate" ? "Australia/Sydney" : "UTC",
  }).format(date)
}

const SERIES_PREFIX: Record<string, string> = { forecast: "Forecast ", band: "Likely range " }

/** Tooltip text for a series value. The forecast band arrives as a [p10, p90] pair */
export function formatSeriesValue(value: unknown, name: unknown, unit = "kWh") {
  const text = Array.isArray(value)
    ? `${formatChartValue(Number(value[0]), unit)} – ${formatChartValue(Number(value[1]), unit)}`
    : formatChartValue(Number(value), unit)

  return [`${SERIES_PREFIX[String(name)] ?? ""}${text}`, unit === "AUD" ? "" : unit]
}

/** Opposite hue with the same lightness and saturation, e.g. #217acc -> #cc7321 */
export function complementColor(color: string) {
  const match = color.match(/^#([0-9a-f]{6})$/i)
  if (!match) return "var(--color-brand-warning-500)"

  const channels = [0, 2, 4].map((i) => parseInt(match[1].slice(i, i + 2), 16))
  const sum = Math.max(...channels) + Math.min(...channels)
  return `#${channels.map((c) => (sum - c).toString(16).padStart(2, "0")).join("")}`
}

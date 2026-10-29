import type { DailyUsage } from "@/lib/api"

/** Daily kWh limits for one meter. Either bound can be left empty */
export type AlertRule = {
  meterId: string
  /** Address shown in lists, saved so it doesn't need looking up again */
  label: string
  lower?: number
  upper?: number
}

export type Breach = {
  meterId: string
  label: string
  date: string
  kwh: number
  limit: number
  direction: "over" | "under"
  /** How far past the limit, e.g. 42 = 42% over */
  percent: number
}

/** Every day a meter went above its upper limit or below its lower limit, newest first */
export function findBreaches(rules: AlertRule[], usage: DailyUsage[]): Breach[] {
  const rulesByMeter = new Map(rules.map((rule) => [rule.meterId, rule]))
  const breaches: Breach[] = []

  for (const day of usage) {
    const rule = rulesByMeter.get(day.meterId)
    if (!rule) continue

    if (rule.upper !== undefined && day.kwh > rule.upper) {
      breaches.push({ ...pick(rule, day), limit: rule.upper, direction: "over", percent: percentPast(day.kwh, rule.upper) })
    } else if (rule.lower !== undefined && day.kwh < rule.lower) {
      breaches.push({ ...pick(rule, day), limit: rule.lower, direction: "under", percent: percentPast(day.kwh, rule.lower) })
    }
  }

  return breaches.sort((a, b) => b.date.localeCompare(a.date) || a.label.localeCompare(b.label))
}

/** Breaches within `days` of the latest date in the data (not today: the data is historical) */
export function recentBreaches(breaches: Breach[], usage: DailyUsage[], days = 30): Breach[] {
  const latest = usage.reduce((max, day) => (day.date > max ? day.date : max), "")
  if (!latest) return []

  const cutoff = new Date(`${latest}T00:00:00Z`)
  cutoff.setUTCDate(cutoff.getUTCDate() - days + 1)
  const from = cutoff.toISOString().slice(0, 10)
  return breaches.filter((breach) => breach.date >= from)
}

/**
 * Suggested limits from history: the range the meter stays within on 90% of days
 * (5th to 95th percentile), so roughly one day in ten raises an alert.
 */
export function suggestLimits(values: number[]): { lower: number; upper: number } | null {
  if (values.length < 14) return null

  const sorted = [...values].sort((a, b) => a - b)
  return { lower: Math.round(percentile(sorted, 0.05)), upper: Math.round(percentile(sorted, 0.95)) }
}

function percentile(sorted: number[], q: number) {
  const index = (sorted.length - 1) * q
  const below = Math.floor(index)
  const above = Math.ceil(index)
  return sorted[below] + (sorted[above] - sorted[below]) * (index - below)
}

function percentPast(kwh: number, limit: number) {
  if (limit === 0) return 100
  return Math.round((Math.abs(kwh - limit) / Math.abs(limit)) * 100)
}

function pick(rule: AlertRule, day: DailyUsage) {
  return { meterId: rule.meterId, label: rule.label, date: day.date, kwh: day.kwh }
}

import type { MarketSeries } from "@/lib/api"

export const SEASONS = {
  year: { label: "Whole year", months: undefined },
  summer: { label: "Summer (Dec–Feb)", months: [12, 1, 2] },
  autumn: { label: "Autumn (Mar–May)", months: [3, 4, 5] },
  winter: { label: "Winter (Jun–Aug)", months: [6, 7, 8] },
  spring: { label: "Spring (Sep–Nov)", months: [9, 10, 11] },
} satisfies Record<string, { label: string; months?: number[] }>

export type Season = keyof typeof SEASONS

export function toSeason(value: string | undefined): Season {
  return value && value in SEASONS ? (value as Season) : "year"
}

/** Checked with the dataviz palette validator against the card surface */
export const MARKET_COLORS: Record<MarketSeries, string> = {
  price: "#217acc",
  solar_rooftop: "#e8890c",
  solar_utility: "#b45309",
  demand: "#217acc",
  gullen_solar: "#e8890c",
}

export const MARKET_LABELS: Record<MarketSeries, string> = {
  price: "Spot price",
  demand: "Demand",
  solar_rooftop: "Rooftop solar",
  solar_utility: "Utility solar",
  gullen_solar: "Gullen Range solar",
}

export const MARKET_SOURCE = "Source: OpenElectricity, NSW region (CC BY-NC 4.0)"

/**
 * Formats API dates in NEM time (always UTC+10, no daylight saving).
 * The API sends naive UTC strings, so they're read as UTC first.
 */
export function formatNemDate(value: string, options: Intl.DateTimeFormatOptions) {
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: "Etc/GMT-10" }).format(date)
}

export function formatPrice(value: number) {
  return `$${Math.round(value).toLocaleString()}/MWh`
}

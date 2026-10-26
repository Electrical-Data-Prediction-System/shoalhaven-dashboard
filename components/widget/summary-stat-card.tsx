"use client"

import type { IconType } from "react-icons"
import { FaDollarSign } from "react-icons/fa"
import { FaGaugeHigh } from "react-icons/fa6"
import { MdEnergySavingsLeaf } from "react-icons/md"

import { Skeleton } from "@/components/ui/skeleton"
import { useApiData } from "@/hooks/use-ApiData"
import { GetPowerSummary, type MonthSummary } from "@/lib/api"
import { StatCard } from "./stat-card"

type SummaryKind = "consumption" | "busiest" | "cost"

const currency = new Intl.NumberFormat(undefined, { style: "currency", currency: "AUD", maximumFractionDigits: 0 })
const kwh = (value: number) => `${Math.round(value).toLocaleString()} kWh`

// Months and days are stored as Sydney wall time, so they're formatted as UTC to keep the date unchanged
const monthLabel = (value: string, year = false) =>
  new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", year: year ? "numeric" : undefined, timeZone: "UTC" })
const dayLabel = (value: string) =>
  new Date(`${value.slice(0, 10)}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" })

/** "+12.3%" style change, or null when there's nothing to compare against */
export function percentChange(current: number | null | undefined, previous: number | null | undefined) {
  if (current == null || previous == null || previous === 0) return null
  const change = ((current - previous) / Math.abs(previous)) * 100
  return { text: `${change > 0 ? "+" : ""}${change.toFixed(1)}%`, change }
}

const KINDS: Record<SummaryKind, {
  icon: IconType
  value: (month: MonthSummary) => number | null
  format: (value: number) => string
  footer: (current: MonthSummary, previous: MonthSummary) => string
}> = {
  consumption: {
    icon: MdEnergySavingsLeaf,
    value: (month) => month.totalKwh,
    format: kwh,
    footer: (current, previous) => `${monthLabel(current.month, true)}, vs ${monthLabel(previous.month)}`,
  },
  busiest: {
    icon: FaGaugeHigh,
    value: (month) => month.busiestDay?.kwh ?? null,
    format: kwh,
    footer: (current, previous) => current.busiestDay && previous.busiestDay
      ? `${dayLabel(current.busiestDay.date)}, vs ${dayLabel(previous.busiestDay.date)}`
      : "",
  },
  cost: {
    icon: FaDollarSign,
    value: (month) => month.wholesaleCost,
    format: (value) => currency.format(value),
    footer: (current, previous) => current.wholesaleCost === null
      ? "No market data, run pushMarket"
      : `Wholesale, ${monthLabel(current.month)} vs ${monthLabel(previous.month)}`,
  },
}

/** A top-of-dashboard stat card filled from the monthly power summary */
export function SummaryStatCard({ kind }: { kind: SummaryKind }) {
  const { data, error, isLoading } = useApiData(GetPowerSummary)
  const config = KINDS[kind]

  if (isLoading) return <Skeleton className="h-full w-full" />
  if (error || !data?.current || !data.previous) {
    return <p className="text-sm text-destructive">Failed to load: {error?.message ?? "unexpected response"}</p>
  }

  const current = config.value(data.current)
  const trend = percentChange(current, config.value(data.previous))

  return (
    <StatCard
      value={current === null ? "–" : config.format(current)}
      icon={config.icon}
      trendValue={trend?.text ?? "–"}
      // Using or spending less than last month is the good direction
      trendPositive={(trend?.change ?? 0) <= 0}
      footerText={config.footer(data.current, data.previous)}
    />
  )
}

"use client"

import { CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { AlertRule } from "@/lib/alerts"
import type { DailyUsage } from "@/lib/api"

const BREACH_COLOR = "#c0392b"
const config = { kwh: { label: "Daily kWh", color: "#217acc" } } satisfies ChartConfig

const dayLabel = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { ...options, timeZone: "UTC" })

const isBreach = (kwh: number, rule: AlertRule) =>
  (rule.upper !== undefined && kwh > rule.upper) || (rule.lower !== undefined && kwh < rule.lower)

/** A meter's daily usage with its limits as dashed lines and breach days marked in red */
export function AlertMeterChart({ rule, usage }: { rule: AlertRule; usage: DailyUsage[] }) {
  const data = usage.filter(({ meterId }) => meterId === rule.meterId)

  return (
    <ChartContainer config={config} className="h-full w-full aspect-auto">
      <ComposedChart data={data} accessibilityLayer margin={{ top: 16, right: 16, bottom: 4, left: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={32} tickFormatter={(value) => dayLabel(String(value), { month: "short", day: "numeric" })} />
        <YAxis tickLine={false} axisLine={false} width={52} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => dayLabel(String(payload?.[0]?.payload?.date), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              formatter={(value) => {
                const kwh = Number(value)
                return `${Math.round(kwh).toLocaleString()} kWh${isBreach(kwh, rule) ? " · outside limits" : ""}`
              }}
            />
          }
        />
        {rule.upper !== undefined && (
          <ReferenceLine y={rule.upper} stroke={BREACH_COLOR} strokeDasharray="5 4" label={{ value: `Upper ${rule.upper.toLocaleString()} kWh`, position: "insideTopRight", fontSize: 11, fill: BREACH_COLOR }} />
        )}
        {rule.lower !== undefined && (
          <ReferenceLine y={rule.lower} stroke={BREACH_COLOR} strokeDasharray="5 4" label={{ value: `Lower ${rule.lower.toLocaleString()} kWh`, position: "insideBottomRight", fontSize: 11, fill: BREACH_COLOR }} />
        )}
        <Line
          dataKey="kwh"
          type="monotone"
          stroke="var(--color-kwh)"
          strokeWidth={1.5}
          isAnimationActive={false}
          // Only breach days get a dot, so they stand out
          dot={(props: { cx?: number; cy?: number; index?: number; payload?: DailyUsage }) =>
            props.payload && isBreach(props.payload.kwh, rule)
              ? <circle key={props.index} cx={props.cx} cy={props.cy} r={3.5} fill={BREACH_COLOR} stroke="var(--card)" strokeWidth={1.5} />
              : <g key={props.index} />}
        />
      </ComposedChart>
    </ChartContainer>
  )
}

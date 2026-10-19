"use client"

import { Point, ResponsiveLine } from "@nivo/line";
import type { NivoSerie } from "@/lib/chart-data";
import type { WidgetFormConfig } from "@/contexts/widget-context";

export type SeriesData = NivoSerie[];

function makePointTooltip(unit?: string) {
  return function PointTooltip({ point }: { point: Point<SeriesData[number]> }) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs shadow-md">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: point.seriesColor }}
        />
        <span className="font-medium">{point.seriesId}</span>
        <span className="text-muted-foreground">
          {point.data.xFormatted}: {point.data.yFormatted}{unit ? ` ${unit}` : ""}
        </span>
      </div>
    );
  }
}

function formatXAxisValue(
  value: string,
  dataMode: WidgetFormConfig["dataMode"],
  timePeriod: WidgetFormConfig["timePeriod"],
) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/)
  if (!match) return value

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match
  const date = dataMode === "aggregate"
    ? new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)
    : new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second)))
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

function getXAxisTickValues(series: NivoSerie[]) {
  const points = series[0]?.data ?? []
  if (points.length <= 12) return undefined

  const step = Math.ceil((points.length - 1) / 11)
  const ticks = points.filter((_, index) => index % step === 0).map(({ x }) => x)
  const lastPoint = points.at(-1)?.x
  if (lastPoint && ticks.at(-1) !== lastPoint) ticks.push(lastPoint)
  return ticks
}

export function LineGraph({
  series,
  unit,
  dataMode,
  timePeriod,
}: {
  series: NivoSerie[]
  unit?: string
  dataMode: WidgetFormConfig["dataMode"]
  timePeriod: WidgetFormConfig["timePeriod"]
}) {
  return (
    <ResponsiveLine
      data={series}
      margin={{ top: 10, right: 110, bottom: 30, left: 40 }}
      colors={{ scheme: "category10" }}
      curve="monotoneX"
      axisBottom={{
        tickSize: 0,
        tickPadding: 8,
        tickValues: getXAxisTickValues(series),
        format: (value) => formatXAxisValue(String(value), dataMode, timePeriod),
      }}
      axisLeft={{ tickSize: 0, tickPadding: 8 }}
      enablePoints
      pointSize={8}
      enableGridX={false}
      useMesh
      tooltip={makePointTooltip(unit)}
      legends={[
        {
          anchor: "right",
          direction: "column",
          translateX: 100,
          itemWidth: 90,
          itemHeight: 18,
          symbolSize: 10,
          symbolShape: "circle",
        },
      ]}
    />
  )
}

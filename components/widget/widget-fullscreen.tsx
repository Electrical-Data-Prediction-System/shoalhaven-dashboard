"use client"

import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useWidgetContext, type CreatedWidget } from "@/contexts/widget-context"
import { useModal } from "@/components/forms/modal"
import type { ChartRow } from "@/lib/chart-data"
import type { ApiForecast } from "@/lib/api"
import { formatTableDate } from "@/lib/chart-format"
import { WidgetVisualization } from "./widget-visualization"

const currencyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "AUD",
})

type RatePeriod = { key: string; label: string; x: string; kwh: number }
const EMPTY_CHART_DATA: ChartRow[] = []

function getSydneyDateKey(value: string) {
  const date = new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value ?? ""
  return `${part("year")}-${part("month")}-${part("day")}`
}

function getRatePeriods(widget: CreatedWidget, data: ChartRow[]): RatePeriod[] {
  const groupByDay = widget.dataMode === "readings" || widget.timePeriod === "5m"
  const grouped = new Map<string, number>()

  for (const row of data) {
    const key = groupByDay
      ? widget.dataMode === "readings"
        ? row.x.slice(0, 10)
        : getSydneyDateKey(row.x)
      : row.x
    grouped.set(key, (grouped.get(key) ?? 0) + row.kwh)
  }

  return [...grouped].sort(([left], [right]) => left.localeCompare(right)).map(([key, kwh]) => {
    const label = groupByDay
      ? new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${key}T00:00:00Z`))
      : formatTableDate(key, widget.dataMode, widget.timePeriod)
    return { key, kwh, label, x: groupByDay ? label : key }
  })
}

export function WidgetFullscreen({
  widget,
  data,
  error,
  isLoading,
  forecast,
}: {
  widget: CreatedWidget
  data?: ChartRow[]
  error?: Error
  isLoading: boolean
  forecast?: ApiForecast | null
}) {
  const { closeModal } = useModal()
  const { updateCreatedWidgetRates, updateCreatedWidgetColor } = useWidgetContext()
  const [metric, setMetric] = useState<"energy" | "cost">("energy")
  const [draftRates, setDraftRates] = useState<Record<string, number>>(widget.ratesByPeriod ?? {})
  const [seriesColor, setSeriesColor] = useState(widget.seriesColor ?? "#217acc")
  const [baseRate, setBaseRate] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const chartData = data ?? EMPTY_CHART_DATA
  const ratePeriods = useMemo(() => getRatePeriods(widget, chartData), [widget, chartData])
  const selectedPeriodKey = ratePeriods.some(({ key }) => key === selectedPeriod)
    ? selectedPeriod
    : ratePeriods[0]?.key ?? ""
  const selectedRate = selectedPeriodKey ? draftRates[selectedPeriodKey] : undefined
  const costData = ratePeriods.flatMap((period) => {
    const rate = draftRates[period.key]
    return rate === undefined ? [] : [{ x: period.x, kwh: (period.kwh * rate) / 100 }]
  })
  const totalCost = ratePeriods.reduce(
    (sum, period) => sum + (period.kwh * (draftRates[period.key] ?? 0)) / 100,
    0,
  )
  const missingRateCount = ratePeriods.filter(({ key }) => draftRates[key] === undefined).length

  const updateSelectedRate = (value: string) => {
    if (!selectedPeriodKey) return
    setIsSaved(false)
    setDraftRates((current) => {
      const next = { ...current }
      if (value === "") {
        delete next[selectedPeriodKey]
      } else {
        const rate = Number(value)
        if (Number.isFinite(rate) && rate >= 0) next[selectedPeriodKey] = rate
      }
      return next
    })
  }

  const applyRateToAll = () => {
    if (baseRate.trim() === "") return
    const rate = Number(baseRate)
    if (!Number.isFinite(rate) || rate < 0 || !ratePeriods.length) return
    setDraftRates((current) => ({
      ...current,
      ...Object.fromEntries(ratePeriods.map(({ key }) => [key, rate])),
    }))
    setIsSaved(false)
  }

  const saveRates = () => {
    updateCreatedWidgetRates(widget.id, draftRates)
    updateCreatedWidgetColor(widget.id, seriesColor)
    setIsSaved(true)
  }

  const displayData = metric === "cost" ? costData : chartData

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <main className="flex min-h-0 flex-col gap-3">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-3">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold">{widget.name}</h2>
            <p className="text-xs text-muted-foreground">{widget.meterId}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-md border p-0.5">
              <Button type="button" size="sm" variant={metric === "energy" ? "secondary" : "ghost"} onClick={() => setMetric("energy")}>
                kWh
              </Button>
              <Button type="button" size="sm" variant={metric === "cost" ? "secondary" : "ghost"} onClick={() => setMetric("cost")}>
                Cost
              </Button>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close expanded chart" title="Close" onClick={closeModal}>
              <X />
            </Button>
          </div>
        </header>
        <div className="min-h-0 flex-1">
          {isLoading && <Skeleton className="h-full w-full" />}
          {error && <p className="p-2 text-sm text-destructive">Failed to load: {error.message}</p>}
          {!isLoading && !error && metric === "cost" && !costData.length && (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Set an energy rate to view estimated cost.
            </p>
          )}
          {!isLoading && !error && metric === "energy" && !chartData.length && (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No readings found for this meter and time range.
            </p>
          )}
          {!isLoading && !error && displayData.length > 0 && (
            <WidgetVisualization
              widget={widget}
              data={displayData}
              unit={metric === "cost" ? "AUD" : "kWh"}
              seriesColor={seriesColor}
              forecast={forecast}
            />
          )}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto border-t pt-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
        {forecast && <ForecastSummary forecast={forecast} rates={Object.values(draftRates)} />}

        <div>
          <h3 className="text-sm font-semibold">Energy pricing</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Set a rate per kWh for each displayed period. Prices are saved with this widget.
          </p>
        </div>

        {(widget.type === "line" || widget.type === "area") && (
          <div className="grid gap-2 border-b pb-4">
            <label htmlFor="series-color" className="text-sm font-medium">Chart color</label>
            <div className="flex items-center gap-3">
              <Input
                id="series-color"
                type="color"
                aria-label="Chart color"
                className="h-9 w-14 cursor-pointer p-1"
                value={seriesColor}
                onChange={(event) => {
                  setSeriesColor(event.target.value)
                  setIsSaved(false)
                }}
              />
              <span className="font-mono text-sm uppercase">{seriesColor}</span>
            </div>
          </div>
        )}

        <div className="grid gap-2 border-b pb-4">
          <label htmlFor="base-rate" className="text-sm font-medium">Apply one rate to all periods</label>
          <div className="flex gap-2">
            <Input
              id="base-rate"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 32"
              value={baseRate}
              onChange={(event) => setBaseRate(event.target.value)}
            />
            <Button type="button" variant="outline" onClick={applyRateToAll}>Apply</Button>
          </div>
          <p className="text-xs text-muted-foreground">Cents per kWh</p>
        </div>

        <div className="grid gap-2">
          <label htmlFor="rate-period" className="text-sm font-medium">Adjust one period</label>
          <Select
            items={ratePeriods.map(({ key, label }) => ({ value: key, label }))}
            value={selectedPeriodKey}
            onValueChange={(value) => setSelectedPeriod(value ?? "")}
          >
            <SelectTrigger id="rate-period" className="w-full">
              <SelectValue placeholder="Select a period" />
            </SelectTrigger>
            <SelectContent>
              {ratePeriods.map(({ key, label }) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="period-rate"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            aria-label="Cents per kWh for selected period"
            placeholder="Cents per kWh"
            value={selectedRate ?? ""}
            onChange={(event) => updateSelectedRate(event.target.value)}
            disabled={!selectedPeriodKey}
          />
        </div>

        <div className="mt-auto border-t pt-4">
          <p className="text-xs text-muted-foreground">
            {missingRateCount > 0 ? `${missingRateCount} periods still need a rate` : "All periods have a rate"}
          </p>
          <p className="mt-1 text-lg font-semibold">
            {missingRateCount > 0 ? "Priced subtotal" : "Estimated total"}: {currencyFormatter.format(totalCost)}
          </p>
          <Button type="button" className="mt-3 w-full" onClick={saveRates} disabled={!ratePeriods.length}>
            {isSaved ? "Rates saved" : "Save rates"}
          </Button>
        </div>
      </aside>
    </div>
  )
}

function ForecastSummary({ forecast, rates }: { forecast: ApiForecast; rates: number[] }) {
  const unit = forecast.granularity === "hour" ? "hours" : "days"
  const totalKwh = forecast.points.reduce((sum, point) => sum + point.p50, 0)
  // Projected cost uses the average of the rates entered for this widget
  const averageRate = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : undefined
  const { backtest } = forecast
  const generated = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(forecast.generatedAt))

  return (
    <div className="grid gap-1.5 border-b pb-4">
      <h3 className="text-sm font-semibold">Forecast</h3>
      <p className="text-xs text-muted-foreground">{forecast.model}, generated {generated}</p>
      <p className="text-sm">
        Next {forecast.points.length} {unit}:{" "}
        <span className="font-semibold">{Math.round(totalKwh).toLocaleString()} kWh</span>
      </p>
      {averageRate !== undefined && (
        <p className="text-sm">
          Projected cost: <span className="font-semibold">{currencyFormatter.format((totalKwh * averageRate) / 100)}</span>
        </p>
      )}
      {backtest?.modelMape != null && backtest.baselineMape != null && (
        <p className="text-xs text-muted-foreground">
          Tested on the last {backtest.horizon} {unit} of real data: {backtest.modelMape.toFixed(1)}% average error,
          vs {backtest.baselineMape.toFixed(1)}% for repeating the last {forecast.granularity === "hour" ? "week" : "week's pattern"}.
        </p>
      )}
    </div>
  )
}

"use client"

import { X } from "lucide-react"

import { useModal } from "@/components/forms/modal"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWidgetContext } from "@/features/dashboard/context/widget-context"
import type { PlacedWidget } from "@/features/dashboard/widgets/types"
import type { Breach } from "@/lib/alerts"
import { cn } from "@/lib/utils"
import { AlertMeterChart } from "./alert-meter-chart"
import { AlertRulesForm } from "./alert-rules-form"
import { useAlertBreaches } from "./use-alerts"

const dayLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })

/** A meter's daily chart with its limits, opened from an alert */
function AlertDetail({ meterId }: { meterId: string }) {
  const { closeModal } = useModal()
  const { rules, usage, breaches } = useAlertBreaches()
  const rule = rules.find((entry) => entry.meterId === meterId)
  if (!rule) return null
  const count = breaches.filter((breach) => breach.meterId === meterId).length

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <header className="flex items-start justify-between gap-3 border-b pb-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{rule.label}</h2>
          <p className="text-xs text-muted-foreground">
            {rule.meterId} · {count} {count === 1 ? "day" : "days"} outside the limits in the last year
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Close" onClick={closeModal}>
          <X />
        </Button>
      </header>
      <div className="min-h-0 flex-1">
        <AlertMeterChart rule={rule} usage={usage} />
      </div>
    </div>
  )
}

function BreachRow({ breach, onOpen }: { breach: Breach; onOpen: () => void }) {
  const over = breach.direction === "over"

  return (
    <li>
      <button type="button" onClick={onOpen} className="flex w-full cursor-pointer items-center gap-3 px-2 py-1.5 text-left text-sm hover:bg-muted">
        <span
          className={cn("w-16 shrink-0 rounded px-1.5 py-0.5 text-center text-xs font-medium", over ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800")}
        >
          {over ? "▲" : "▼"} {breach.percent}%
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{breach.label}</span>
          <span className="block text-xs text-muted-foreground">
            {dayLabel(breach.date)} · {Math.round(breach.kwh).toLocaleString()} kWh, {over ? "upper" : "lower"} limit {breach.limit.toLocaleString()}
          </span>
        </span>
      </button>
    </li>
  )
}

/** Every day a meter went outside its limits, newest first */
export function AlertsWidget({ widget }: { widget: PlacedWidget }) {
  const { openModal } = useModal()
  const { updatePlacedOptions } = useWidgetContext()
  const { rules, usage, breaches, recent, error, isLoading } = useAlertBreaches()
  const latest = usage.reduce((max, day) => (day.date > max ? day.date : max), "")
  const showAll = widget.options?.range === "all"
  const shown = showAll ? breaches : recent

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex rounded-md border p-0.5">
        {(["recent", "all"] as const).map((range) => (
          <Button
            key={range}
            type="button"
            size="sm"
            variant={(range === "all") === showAll ? "secondary" : "ghost"}
            onClick={() => updatePlacedOptions(widget.id, { range })}
          >
            {range === "all" ? "Last year" : "Last 30 days"}
          </Button>
        ))}
      </div>
      <Button type="button" size="sm" variant="outline" onClick={() => openModal(<AlertRulesForm />)}>
        Limits ({rules.length})
      </Button>
    </div>
  )

  let body
  if (!rules.length) {
    body = <p className="text-sm text-muted-foreground">No limits set yet. Use “Limits” to add a meter’s daily kWh range.</p>
  } else if (isLoading) {
    body = <Skeleton className="h-full w-full" />
  } else if (error) {
    body = <p className="text-sm text-destructive">Failed to load: {error.message}</p>
  } else if (!shown.length) {
    body = <p className="text-sm text-muted-foreground">No days outside the limits {showAll ? "in the last year" : "in the last 30 days of data"}.</p>
  } else {
    body = (
      <ul className="h-full divide-y overflow-y-auto rounded-md border">
        {shown.map((breach) => (
          <BreachRow
            key={`${breach.meterId}-${breach.date}`}
            breach={breach}
            onOpen={() => openModal(<AlertDetail meterId={breach.meterId} />, "fullscreen")}
          />
        ))}
      </ul>
    )
  }

  return (
    <div className="flex h-full flex-col gap-2">
      {header}
      <p className="text-xs text-muted-foreground">
        {shown.length} {shown.length === 1 ? "alert" : "alerts"} across {rules.length} {rules.length === 1 ? "meter" : "meters"}
        {latest && ` · data runs to ${dayLabel(latest)}`}
      </p>
      <div className="min-h-0 flex-1">{body}</div>
    </div>
  )
}

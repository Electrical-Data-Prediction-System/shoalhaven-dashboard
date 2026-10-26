"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Trash2 } from "lucide-react"

import { useModal } from "@/components/forms/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWidgetContext } from "@/features/dashboard/context/widget-context"
import { WIDGETS } from "@/features/dashboard/widgets/widgets"
import { suggestLimits, type AlertRule } from "@/lib/alerts"
import { SearchMetersByLocation, type MeterSearchResult } from "@/lib/api"
import { loadDailyUsage, useAlertRules } from "./use-alerts"

const formatLimit = (value?: number) => (value === undefined ? "–" : `${value.toLocaleString()} kWh`)
const toNumber = (value: string) => (value.trim() === "" ? undefined : Number(value))

/** Add, edit and delete each meter's daily kWh limits */
export function AlertRulesForm() {
  const { closeModal } = useModal()
  const { placed, addPlacedWidget, highlight } = useWidgetContext()
  const { rules, saveRule, deleteRule } = useAlertRules()

  const [query, setQuery] = useState("")
  const [results, setResults] = useState<MeterSearchResult[]>([])
  const [meter, setMeter] = useState<{ id: string; label: string } | null>(null)
  const [lower, setLower] = useState("")
  const [upper, setUpper] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [isSuggesting, setIsSuggesting] = useState(false)

  // Same debounced meter search as the chart form
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2 || meter?.label === term) return

    let cancelled = false
    const timeout = window.setTimeout(() => {
      SearchMetersByLocation(term)
        .then((found) => !cancelled && setResults(found))
        .catch(() => !cancelled && setResults([]))
    }, 250)
    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [query, meter])

  const choose = (id: string, label: string, rule?: AlertRule) => {
    setMeter({ id, label })
    setQuery(label)
    setResults([])
    setLower(rule?.lower?.toString() ?? "")
    setUpper(rule?.upper?.toString() ?? "")
    setMessage(null)
  }

  const suggest = async () => {
    if (!meter) return
    setIsSuggesting(true)
    try {
      const usage = await loadDailyUsage([meter.id])
      const limits = suggestLimits(usage.map(({ kwh }) => kwh))
      if (!limits) {
        setMessage("Not enough history to suggest limits.")
        return
      }
      setLower(String(limits.lower))
      setUpper(String(limits.upper))
      setMessage(`Suggested from ${usage.length} days: the range this meter stays within on 90% of days.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load this meter's history.")
    } finally {
      setIsSuggesting(false)
    }
  }

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!meter) return

    const nextLower = toNumber(lower)
    const nextUpper = toNumber(upper)
    if (nextLower === undefined && nextUpper === undefined) {
      setMessage("Set a lower limit, an upper limit or both.")
      return
    }
    if (nextLower !== undefined && nextUpper !== undefined && nextLower >= nextUpper) {
      setMessage("The lower limit must be below the upper limit.")
      return
    }

    saveRule({ meterId: meter.id, label: meter.label, lower: nextLower, upper: nextUpper })
    setMeter(null)
    setQuery("")
    setLower("")
    setUpper("")
    setMessage(null)
  }

  const showOnDashboard = () => {
    const existing = placed.find((widget) => widget.type === "alerts")
    const id = existing?.id ?? addPlacedWidget("alerts", WIDGETS.alerts.defaultSize)
    closeModal()
    requestAnimationFrame(() => highlight(id))
  }

  return (
    <div className="modal-content max-h-[calc(100dvh-4rem)] space-y-4 overflow-y-auto">
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold">Alert limits</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Flag any day a meter uses more than its upper limit (spikes, leaks, stuck pumps) or less than its lower limit (failures, dead meters). Saved in this browser.
        </p>
      </div>

      {rules.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {rules.map((rule) => (
            <li key={rule.meterId} className="flex items-center gap-2 p-2 text-sm">
              <button
                type="button"
                className="min-w-0 flex-1 cursor-pointer text-left"
                onClick={() => choose(rule.meterId, rule.label, rule)}
                title="Edit these limits"
              >
                <span className="block truncate font-medium">{rule.label}</span>
                <span className="block text-xs text-muted-foreground">
                  {rule.meterId} · lower {formatLimit(rule.lower)} · upper {formatLimit(rule.upper)}
                </span>
              </button>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete limits for ${rule.label}`} onClick={() => deleteRule(rule.meterId)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={save} className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-semibold">{meter && rules.some((rule) => rule.meterId === meter.id) ? "Edit limits" : "Add limits"}</h3>

        <div className="space-y-1">
          <label htmlFor="alert-meter" className="text-sm font-medium">Meter</label>
          <Input
            id="alert-meter"
            placeholder="Search by address, suburb or postcode"
            autoComplete="off"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setMeter(null)
            }}
          />
          {results.length > 0 && !meter && (
            <ul className="max-h-40 overflow-y-auto rounded-md border text-sm">
              {results.map((result) => (
                <li key={result._id}>
                  <button
                    type="button"
                    className="w-full cursor-pointer px-2 py-1.5 text-left hover:bg-muted"
                    onClick={() => choose(result._id, result.location.fullAddress, rules.find((rule) => rule.meterId === result._id))}
                  >
                    {result.location.fullAddress} <span className="text-muted-foreground">({result._id})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="alert-lower" className="text-sm font-medium">Lower limit <span className="font-normal text-muted-foreground">(kWh/day)</span></label>
            <Input id="alert-lower" type="number" min="0" step="any" value={lower} onChange={(event) => setLower(event.target.value)} />
          </div>
          <div className="space-y-1">
            <label htmlFor="alert-upper" className="text-sm font-medium">Upper limit <span className="font-normal text-muted-foreground">(kWh/day)</span></label>
            <Input id="alert-upper" type="number" min="0" step="any" value={upper} onChange={(event) => setUpper(event.target.value)} />
          </div>
        </div>

        {message && <p className="text-xs text-muted-foreground">{message}</p>}

        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" disabled={!meter || isSuggesting} onClick={suggest}>
            {isSuggesting ? "Suggesting…" : "Suggest from history"}
          </Button>
          <Button type="submit" disabled={!meter}>Save limits</Button>
        </div>
      </form>

      <div className="flex justify-between gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={showOnDashboard} disabled={!rules.length}>
          Show alerts on dashboard
        </Button>
        <Button type="button" variant="ghost" onClick={closeModal}>Close</Button>
      </div>
    </div>
  )
}

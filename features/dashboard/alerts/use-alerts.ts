"use client"

import { useApiData } from "@/hooks/use-ApiData"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { findBreaches, recentBreaches, type AlertRule } from "@/lib/alerts"
import { GetDailyUsage, type DailyUsage } from "@/lib/api"

const EMPTY_RULES: AlertRule[] = []

/** Alert limits, saved in this browser like the dashboard layout */
export function useAlertRules() {
  const [rules, setRules] = useLocalStorage<AlertRule[]>("dashboard.alertRules", EMPTY_RULES)

  const saveRule = (rule: AlertRule) =>
    setRules([...rules.filter(({ meterId }) => meterId !== rule.meterId), rule])
  const deleteRule = (meterId: string) =>
    setRules(rules.filter((rule) => rule.meterId !== meterId))

  return { rules, saveRule, deleteRule }
}

// Several components ask for the same meters' daily usage, so share one request per set of meters
const usageRequests = new Map<string, Promise<DailyUsage[]>>()

export function loadDailyUsage(meterIds: string[]): Promise<DailyUsage[]> {
  if (!meterIds.length) return Promise.resolve([])

  const key = [...meterIds].sort().join(",")
  if (!usageRequests.has(key)) {
    usageRequests.set(key, GetDailyUsage(meterIds).catch((error: unknown) => {
      usageRequests.delete(key)
      throw error
    }))
  }
  return usageRequests.get(key)!
}

/** Every breach of the saved limits, plus those in the last 30 days of data */
export function useAlertBreaches() {
  const { rules } = useAlertRules()
  const meterIds = rules.map(({ meterId }) => meterId)
  const { data: usage, error, isLoading } = useApiData(
    () => loadDailyUsage(meterIds),
    [meterIds.slice().sort().join(",")],
  )

  const breaches = usage ? findBreaches(rules, usage) : []
  return {
    rules,
    usage: usage ?? [],
    breaches,
    recent: usage ? recentBreaches(breaches, usage) : [],
    error,
    isLoading,
  }
}

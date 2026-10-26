import { toChartRows, type ApiPowerResponse } from "@/lib/chart-data"
import { BarGraph } from "./graphs/bar-graph";

/** Presentational: the shell owns fetching, this just feeds the chart. */
export function PowerUsageWidget({ data, unit }: { data: ApiPowerResponse; unit?: string }) {
  return <BarGraph data={toChartRows(data)} unit={unit} timePeriod="month" dataMode="aggregate" />
}

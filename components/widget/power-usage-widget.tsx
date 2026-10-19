import { toChartRows, type ApiPowerResponse } from "@/lib/chart-data"
import { BarGraph } from "./bar-graph";

/** Presentational: the shell owns fetching, this just feeds the chart. */
export function PowerUsageWidget({ data, unit }: { data: ApiPowerResponse; unit?: string }) {
  return <BarGraph data={toChartRows(data)} unit={unit} />
}

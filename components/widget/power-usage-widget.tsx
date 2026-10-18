import { toNivoSeries, type ApiSeries } from "@/lib/chart-data"
import { BarGraph } from "./bar-graph";

/** Presentational: the shell owns fetching, this just feeds the chart. */
export function PowerUsageWidget({ data, unit }: { data: ApiSeries; unit?: string }) {
  return <BarGraph series={toNivoSeries(data)} unit={unit} />
}

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChartRow } from "@/lib/chart-data"
import { formatChartValue, formatTableDate } from "@/lib/chart-format"
import { cn } from "@/lib/utils"
import type { WidgetFormConfig } from "@/contexts/widget-context"

type SortKey = "time" | "value"
type SortState = { key: SortKey; direction: "asc" | "desc" }

function SortButton({
  label,
  column,
  sort,
  onSort,
  className,
}: {
  label: string
  column: SortKey
  sort: SortState
  onSort: (column: SortKey) => void
  className?: string
}) {
  const Icon = sort.key !== column ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      className={cn("inline-flex cursor-pointer items-center gap-1 hover:text-foreground", className)}
      onClick={() => onSort(column)}
    >
      {label}
      <Icon className="size-3.5 text-muted-foreground" />
    </button>
  )
}

export function DataTable({
  data,
  unit = "kWh",
  dataMode,
  timePeriod,
}: {
  data: ChartRow[]
  unit?: string
  dataMode: WidgetFormConfig["dataMode"]
  timePeriod: WidgetFormConfig["timePeriod"]
}) {
  const [sort, setSort] = useState<SortState>({ key: "time", direction: "asc" })
  const valueLabel = unit === "AUD" ? "Cost" : "kWh"

  const rows = useMemo(() => {
    const sign = sort.direction === "asc" ? 1 : -1
    return data
      .map((row, index) => ({ ...row, index }))
      .sort((a, b) => sign * (sort.key === "time" ? a.index - b.index : a.kwh - b.kwh))
  }, [data, sort])

  const total = useMemo(() => data.reduce((sum, row) => sum + row.kwh, 0), [data])

  const onSort = (key: SortKey) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }))
  }

  const ariaSort = (column: SortKey) =>
    sort.key === column ? (sort.direction === "asc" ? "ascending" : "descending") : "none"

  return (
    <div className="h-full [&>[data-slot=table-container]]:h-full">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow className="hover:bg-transparent">
            <TableHead aria-sort={ariaSort("time")}>
              <SortButton label="Time" column="time" sort={sort} onSort={onSort} />
            </TableHead>
            <TableHead aria-sort={ariaSort("value")} className="text-right">
              <SortButton label={valueLabel} column="value" sort={sort} onSort={onSort} className="justify-end" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.x}-${row.index}`}>
              <TableCell>{formatTableDate(row.x, dataMode, timePeriod)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatChartValue(row.kwh, unit)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="sticky bottom-0 bg-muted">
          <TableRow className="hover:bg-transparent">
            <TableCell>Total ({rows.length} rows)</TableCell>
            <TableCell className="text-right tabular-nums">{formatChartValue(total, unit)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

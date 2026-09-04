import { LineGraph, type SeriesData } from "./line-graph"

export function PowerUsageWidget({ data, unit }: { data: SeriesData; unit?: string }) {
    return (
        <div className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold">Power Usage Overview</h3>
            <div className="flex-1">
                <LineGraph data={data} unit={unit} />
            </div>
        </div>
    )
}

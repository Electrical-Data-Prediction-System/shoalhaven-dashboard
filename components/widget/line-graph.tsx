"use client"

import { Point, ResponsiveLine } from "@nivo/line";

export type SeriesData = { id: string; data: { x: string; y: number }[] }[];

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

export function LineGraph({ data, unit }: { data: SeriesData; unit?: string }) {
    return (
        <ResponsiveLine
            data={data}
            margin={{ top: 10, right: 110, bottom: 30, left: 40 }}
            colors={{ scheme: "category10" }}
            curve="monotoneX"
            axisBottom={{ tickSize: 0, tickPadding: 8 }}
            axisLeft={{ tickSize: 0, tickPadding: 8 }}
            enablePoints={false}
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

"use client"

import { GetAllAggregatedMeterPower } from "@/lib/api";
import { Point, ResponsiveLine } from "@nivo/line";
import { useEffect, useState } from "react";

function MonthRange(year : number, from : number, count : number)
{
    return Array.from({ length : count}, (_,i) =>{
        const start = new Date(Date.UTC(year, from + i, 1));

        return {
            label : start.toLocaleDateString("en-AU", {month : "short", timeZone : "UTC"}),
            start,
            end: new Date(Date.UTC(year, from + i + 1, 1))
        }
    })
}

const MONTHS = MonthRange(2025, 1, 10) 

type MeterPower = { name : string, KWH: number};


async function FormatPowerData(){
    const months = await Promise.all(
    MONTHS.map(async ({label, start, end}) =>({
        label,
        meters: (await GetAllAggregatedMeterPower(start, end) as MeterPower[])
    }))
    )

    const series = new Map<string, { x:string; y: number }[]>();
    for (const { label, meters } of months) {
        for(const { name, KWH } of meters) {
            if (!series.has(name)) series.set(name, []);
            series.get(name)!.push({ x: label, y: KWH})
        }
    }

    return Array.from(series, ([id, data]) => ({ id, data}))
}

type Series = Awaited<ReturnType<typeof FormatPowerData>>;

function PointTooltip({ point }: { point: Point<Series[number]> }) {
    return (
        <div className="flex items-center gap-2 rounded-md border bg-background px-2 py-1 text-xs shadow-md">
            <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: point.seriesColor }}
            />
            <span className="font-medium">{point.seriesId}</span>
            <span className="text-muted-foreground">
                {point.data.xFormatted}: {point.data.yFormatted} kWh
            </span>
        </div>
    );
}


export function LineGraph() {
    const [powerUsageData, setPowerUsageData] = useState<Series>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        FormatPowerData()
            .then(setPowerUsageData)
            .catch((e) => setError(e.message));
    }, []);

    console.log("Power")
    console.log(powerUsageData);

    if (error) return <p className="text-sm text-destructive">{error}</p>;

    return (

                <ResponsiveLine
                    data={powerUsageData}
                    margin={{ top: 10, right: 110, bottom: 30, left: 40 }}
                    colors={{ scheme: "category10" }}
                    curve="monotoneX"
                    axisBottom={{ tickSize: 0, tickPadding: 8 }}
                    axisLeft={{ tickSize: 0, tickPadding: 8 }}
                    enablePoints={false}
                    enableGridX={false}
                    useMesh
                    tooltip={PointTooltip}
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
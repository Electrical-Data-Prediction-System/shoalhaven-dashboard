import { GetAllAggregatedMeterPower } from "@/lib/api";
import { MonthRange } from "@/lib/month-format";

type MonthEntry = ReturnType<typeof MonthRange>[number];
type MeterPower = { name: string, KWH: number };

export async function FormatPowerData(months: MonthEntry[]) {
    const results = await Promise.all(
        months.map(async ({ label, start, end }) => ({
            label,
            meters: (await GetAllAggregatedMeterPower(start, end) as MeterPower[])
        }))
    )

    const series = new Map<string, { x: string; y: number }[]>();
    for (const { label, meters } of results) {
        for (const { name, KWH } of meters) {
            if (!series.has(name)) series.set(name, []);
            series.get(name)!.push({ x: label, y: KWH })
        }
    }

    return Array.from(series, ([id, data]) => ({ id, data }))
}

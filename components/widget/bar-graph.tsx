import { NivoSerie, seriesToBar } from "@/lib/chart-data"
import { ResponsiveBar } from "@nivo/bar"

export function BarGraph({ series, unit }: { series: NivoSerie[], unit?: string }) {
  // Convert the NivoSeries first
  const { data, keys, indexBy } = seriesToBar(series)

  return (
    <ResponsiveBar
      data={data}
      keys={keys}
      indexBy={indexBy}
      padding={0.4}
      colors={["#f97316"]}
      enableLabel={false}
      axisBottom={{ tickSize: 0, tickPadding: 8 }}
      axisLeft={{ tickSize: 0, tickPadding: 8 }}
      margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
    />
  )
}

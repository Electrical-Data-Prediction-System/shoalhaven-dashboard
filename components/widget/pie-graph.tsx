import { ResponsivePie } from "@nivo/pie"
import type { NivoSerie } from "@/lib/chart-data"

export function PieGraph({ series }: { series: NivoSerie[]; unit?: string }) {
  const data = series.flatMap((item) =>
    item.data.map(({ x, y }) => ({ id: x, value: y })),
  )

  return (
    <ResponsivePie
      data={data}
      margin={{ top: 12, right: 12, bottom: 36, left: 12 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      enableArcLinkLabels={false}
      arcLabelsSkipAngle={10}
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          translateY: 32,
          itemWidth: 80,
          itemHeight: 16,
          symbolSize: 10,
          symbolShape: "circle",
        },
      ]}
    />
  )
}

import { ResponsiveBar } from "@nivo/bar"

const costOverviewData = [
    { month: "Jul", cost: 22 },
    { month: "Aug", cost: 18 },
    { month: "Sep", cost: 28 },
    { month: "Oct", cost: 20 },
    { month: "Nov", cost: 14 },
    { month: "Dec", cost: 26 },
  ]

export function BarGraph(){
    return (
        <div
        className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm">
        <h3 className="mb-2 text-sm font-semibold">Cost Overview</h3>
        <div className="flex-1">
          <ResponsiveBar
            data={costOverviewData}
            keys={["cost"]}
            indexBy="month"
            padding={0.4}
            colors={["#f97316"]}
            enableLabel={false}
            axisBottom={{ tickSize: 0, tickPadding: 8 }}
            axisLeft={{ tickSize: 0, tickPadding: 8 }}
            margin={{ top: 10, right: 10, bottom: 30, left: 30 }}
          />
        </div>
      </div>
    )

}


import { FaDollarSign } from "react-icons/fa"
import { FaGaugeHigh } from "react-icons/fa6"
import { MdEnergySavingsLeaf } from "react-icons/md"

import { GetAllMeterTotals } from "@/lib/api"
import type { ApiPowerResponse } from "@/lib/chart-data"
import { PowerUsageWidget } from "./power-usage-widget"
import { StationTable } from "./station-table"
import { StatCard } from "./stat-card"
import type { WidgetDefinition } from "./types"
import EnergyCost from "./energy-cost"

/** Pre-built widgets. Add a widget by adding one entry here. */
export const WIDGETS = {
  "energy-consumption": {
    title: "Energy Consumption",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <StatCard value="1,231 KWH" icon={MdEnergySavingsLeaf} trendValue="-5.20%" trendPositive />,
  },
  "peak-load": {
    title: "Peak Load",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <StatCard value="320 KWH" icon={FaGaugeHigh} trendValue="+2.82%" trendPositive={false} />,
  },
  "current-load": {
    title: "Total Revenue",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <StatCard value="$100,000" icon={FaDollarSign} trendValue="-8.12%" trendPositive />,
  },
  "meter-power-usage": {
    title: "Power Usage Overview",
    defaultSize: { w: 6, h: 4 },
    load: () => GetAllMeterTotals(),
    render: (data: ApiPowerResponse) => <PowerUsageWidget data={data} unit="kWh" />,
  },
  // "cost-overview": {
  //   title: "Cost Overview",
  //   defaultSize: { w: 2, h: 4 },
  //   render: () => <BarGraph />,
  // },
  "station-power-usage": {
    title: "Station Usage",
    defaultSize: { w: 4, h: 4 },
    overflow: "hidden",
    render: () => <StationTable />,
  },
  "energy-cost": {
    title: "Energy Cost",
    defaultSize: { w: 4, h: 4 },
    overflow: "hidden",
    render: () => <EnergyCost />,
  }
} satisfies Record<string, WidgetDefinition>

export type WidgetType = keyof typeof WIDGETS

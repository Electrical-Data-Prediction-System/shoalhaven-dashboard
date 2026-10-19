import { GetAllAggregatedMeterPower } from "@/lib/api"
import type { ApiPowerResponse } from "@/lib/chart-data"
import { PowerUsageWidget } from "./power-usage-widget"
import { StationTable } from "./station-table"
import type { WidgetDefinition } from "./types"
import EnergyCost from "./energy-cost"

/** Pre-built widgets. Add a widget by adding one entry here. */
export const WIDGETS = {
  "meter-power-usage": {
    title: "Power Usage Overview",
    defaultSize: { w: 6, h: 4 },
    load: () => GetAllAggregatedMeterPower(),
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

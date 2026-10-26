import { GetAllMeterTotals } from "@/lib/api"
import type { ApiPowerResponse } from "@/lib/chart-data"
import { PowerUsageWidget } from "./power-usage-widget"
import { StationTable } from "./station-table"
import { SummaryStatCard } from "./summary-stat-card"
import type { PlacedWidget, WidgetDefinition } from "./types"
import EnergyCost from "./energy-cost"
import { DuckCurveWidget } from "./market/duck-curve-widget"
import { MarketPriceWidget } from "./market/market-price-widget"
import { MarketStatsWidget } from "./market/market-stats-widget"
import { MeterMapWidget } from "./map/meter-map-widget"

/** Pre-built widgets. Add a widget by adding one entry here. */
export const WIDGETS = {
  "energy-consumption": {
    title: "Energy Consumption",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <SummaryStatCard kind="consumption" />,
  },
  // Keys are kept as they are because they're saved in each browser's layout
  "peak-load": {
    title: "Busiest Day",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <SummaryStatCard kind="busiest" />,
  },
  "current-load": {
    title: "Wholesale Cost",
    defaultSize: { w: 3, h: 2 },
    overflow: "hidden",
    render: () => <SummaryStatCard kind="cost" />,
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
  },
  "meter-map": {
    title: "Meter Map",
    defaultSize: { w: 6, h: 6 },
    overflow: "hidden",
    render: () => <MeterMapWidget />,
  },
  "market-stats": {
    title: "NSW Price Summary",
    category: "market",
    description: "Share of negative-price half hours, midday vs evening prices and the peak",
    defaultSize: { w: 6, h: 3 },
    overflow: "hidden",
    render: (widget: PlacedWidget) => <MarketStatsWidget widget={widget} />,
  },
  "market-price": {
    title: "NSW Spot Price",
    category: "market",
    description: "Daily average wholesale price across 2025",
    defaultSize: { w: 6, h: 4 },
    overflow: "hidden",
    render: (widget: PlacedWidget) => <MarketPriceWidget widget={widget} />,
  },
  "market-duck-curve": {
    title: "Price vs Solar (Average Day)",
    category: "market",
    description: "Average price and solar output for each half hour, showing the midday price dip",
    defaultSize: { w: 6, h: 6 },
    overflow: "hidden",
    render: (widget: PlacedWidget) => <DuckCurveWidget widget={widget} />,
  },
} satisfies Record<string, WidgetDefinition>

export type WidgetType = keyof typeof WIDGETS

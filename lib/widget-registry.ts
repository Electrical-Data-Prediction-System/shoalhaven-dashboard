import { BarGraph } from "@/components/widget/bar-graph";
import { PowerUsageWidget } from "@/components/widget/power-usage-widget";
import { StationTable } from "@/components/widget/station-table";
import { ComponentProps } from "react";

export const WIDGET_REGISTRY = {
    "power-usage": { label: "Power Usage", component: PowerUsageWidget, defaultSize: { w: 6, h: 4 } },
    "cost-overview": { label: "Cost Overview", component: BarGraph, defaultSize: { w: 2, h: 4 } },
    "station-power-usage": { label: "Station Table", component: StationTable, defaultSize: { w: 4, h: 4 } },
} as const;

export type WidgetType = keyof typeof WIDGET_REGISTRY;

export type WidgetProps = {
    [K in WidgetType]: ComponentProps<typeof WIDGET_REGISTRY[K]["component"]>
};

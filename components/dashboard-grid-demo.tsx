"use client"

import { ResponsiveGridLayout, useContainerWidth, type LayoutItem, type ResponsiveLayouts } from "react-grid-layout"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import "react-grid-layout/css/styles.css"
import { StatCard } from "@/components/widget/stat-card"



import { IoWalletSharp } from "react-icons/io5"
import { MdEnergySavingsLeaf } from "react-icons/md"
import { FaGaugeHigh } from "react-icons/fa6"
import { FaDollarSign } from "react-icons/fa"
import { type SeriesData } from "./widget/line-graph"
import { WIDGET_REGISTRY, WidgetType, WidgetProps } from "@/lib/widget-registry"
import { useEffect, useRef, useState } from "react"
import { useWidgetContext } from "@/contexts/widget-context"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "layout-power"


const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: "energy-cost", x: 0, y: 0, w: 3, h: 2 },
    { i: "energy-consumption", x: 3, y: 0, w: 3, h: 2 },
    { i: "peak-load", x: 6, y: 0, w: 3, h: 2 },
    { i: "current-load", x: 9, y: 0, w: 3, h: 2 },
    { i: "power-usage", x: 0, y: 2, w: 6, h: 4 },
    { i: "cost-overview", x: 6, y: 2, w: 2, h: 4 },
    { i: "station-power-usage", x: 0, y: 6, w: 4, h: 4 },
  ],
}



function RenderWidget<T extends WidgetType>({ type, props }: { type: T; props: WidgetProps[T] }) {
  const { component: Widget } = WIDGET_REGISTRY[type];
  // T is generic here, so TS can't correlate Widget's props with WidgetProps[T] — callers are still type-checked, since T resolves to a concrete literal there.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Widget {...(props as any)} />;
}

// Only compare the fields we actually store — the library's reported layouts carry extra
// bookkeeping fields (e.g. `moved`) that make a strict deep-equal always report "changed".
function normalizeLayout(layout?: readonly LayoutItem[]) {
  return [...(layout ?? [])]
    .map(({ i, x, y, w, h }) => ({ i, x, y, w, h }))
    .sort((a, b) => a.i.localeCompare(b.i))
}

function layoutsEqual(a: ResponsiveLayouts, b: ResponsiveLayouts) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    if (JSON.stringify(normalizeLayout(a[key])) !== JSON.stringify(normalizeLayout(b[key]))) {
      return false
    }
  }
  return true
}



export function DashboardGridDemo({ powerUsageData }: { powerUsageData: SeriesData }) {
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  })

  // LOCAL STORAGE STORE WIDGET POSITION
  const [layouts, setLayouts] = useLocalStorage<ResponsiveLayouts>(STORAGE_KEY, defaultLayouts)
  const pendingLayoutChange = useRef<number | null>(null)
  const handleLayoutChange = (_currentLayout: readonly LayoutItem[], allLayouts: ResponsiveLayouts) => {
    if (layoutsEqual(allLayouts, layouts)) return
    if (pendingLayoutChange.current !== null) cancelAnimationFrame(pendingLayoutChange.current)
    pendingLayoutChange.current = requestAnimationFrame(() => {
      pendingLayoutChange.current = null
      setLayouts(allLayouts)
    })
  }

    
  //DEFINE WIDGET TYPES AND PROP TYPES
  const widgetIds: WidgetType[] = ["power-usage", "cost-overview", "station-power-usage"]
  const widgetProps: WidgetProps = {
    "power-usage": { data: powerUsageData, unit: "kWh" },
    "cost-overview": {},
    "station-power-usage": {},
  }

  //CONTEXT
  const { highlightedId } = useWidgetContext()

  useEffect(() => {
    if(!highlightedId) return

    document
      .querySelector(`[data-widget-id="${highlightedId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center"})
  }, [highlightedId])

  // Lets the scroll effect find the element, and rings it while it's the highlighted one
  const highlightProps = (id: string) => ({
    "data-widget-id": id,
    className: cn(
      "rounded-xl transition-shadow duration-300",
      highlightedId === id && "ring-2 ring-blue-500"
    ),
  })

  // Blocks text selection only mid-drag, so dragging doesn't select text across widgets
  const [isDragging, setIsDragging] = useState(false)

  return (
    <div ref={containerRef} className={cn(isDragging && "select-none")}>
      {mounted && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={80}
          margin={[16, 16]}
          onWidthChange={(containerWidth, margin, cols) => console.log({ containerWidth, cols })}
          onLayoutChange={handleLayoutChange}
          onDragStart={() => {
            setIsDragging(true)
            window.getSelection()?.removeAllRanges()
          }}
          onDragStop={() => setIsDragging(false)}
        >

          {/* DYNAMICALLY LOADING WIDGET FROM LIST */}
          {widgetIds.map((type) => (
            <div key={type} {...highlightProps(type)}>
              <RenderWidget type={type} props={widgetProps[type]} />
            </div>
          ))}


          {/* TOP ENERGY CARDS */}
          {/* energy cost*/}
          <StatCard
            key="energy-cost"
            {...highlightProps("energy-cost")}
            description="Energy Cost"
            value="$2,473 KWH"
            icon={IoWalletSharp}
            trendValue="-3.48%"
            trendPositive
          />

          {/* energy consumption */}
          <StatCard
            key="energy-consumption"
            {...highlightProps("energy-consumption")}
            description="Energy Consumption"
            value="1,231 KWH"
            icon={MdEnergySavingsLeaf}
            trendValue="-5.20%"
            trendPositive
          />

          {/* peak load */}
          <StatCard
            key="peak-load"
            {...highlightProps("peak-load")}
            description="Peak Load"
            value="320 KWH"
            icon={FaGaugeHigh}
            trendValue="+2.82%"
            trendPositive={false}
          />

          {/* current load*/}
          <StatCard
            key="current-load"
            {...highlightProps("current-load")}
            description="Total Revenue"
            value="$100,000"
            icon={FaDollarSign}
            trendValue="-8.12%"
            trendPositive
          />

        </ResponsiveGridLayout>
      )}
    </div>
  )
}

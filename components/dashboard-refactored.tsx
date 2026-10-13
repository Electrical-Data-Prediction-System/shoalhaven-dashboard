"use client"

import { useMemo, useRef, useState } from "react"
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "react-grid-layout"
import "react-grid-layout/css/styles.css"

import { FaDollarSign } from "react-icons/fa"
import { FaGaugeHigh } from "react-icons/fa6"
import { MdEnergySavingsLeaf } from "react-icons/md"

import { StatCard } from "@/components/widget/stat-card"
import type { PlacedWidget } from "@/components/widget/types"
import { WidgetShell } from "@/components/widget/widget-shell"
import { WIDGETS, type WidgetType } from "@/components/widget/widgets"
import { useLocalStorage } from "@/hooks/useLocalStorage"

const STORAGE_KEY = "dashboard.widgets"

// Stat cards are pinned for now and live outside the placed-widget system.
const PINNED_LAYOUTS: LayoutItem[] = [
  { i: "energy-cost", x: 0, y: 0, w: 3, h: 2 },
  { i: "energy-consumption", x: 3, y: 0, w: 3, h: 2 },
  { i: "peak-load", x: 6, y: 0, w: 3, h: 2 },
  { i: "current-load", x: 9, y: 0, w: 3, h: 2 },
]

const DEFAULT_PLACED: PlacedWidget<WidgetType>[] = [
  { id: "meter-power-usage", type: "meter-power-usage", layout: { x: 0, y: 2, w: 6, h: 4 } },
  // { id: "cost-overview", type: "cost-overview", layout: { x: 6, y: 2, w: 2, h: 4 } },
  { id: "station-power-usage", type: "station-power-usage", layout: { x: 0, y: 6, w: 4, h: 4 } },
  // { id: "energy-cost", type: "energy-cost", layout: { x: 2, y: 2, w: 4, h: 4 } } Already a stat card lol
]

export function DashboardGrid() {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: true })

  // The placed widgets — which ones exist, plus their size and position.
  const [placed, setPlaced] = useLocalStorage<PlacedWidget<WidgetType>[]>(STORAGE_KEY, DEFAULT_PLACED)
  const [gridInstanceKey, setGridInstanceKey] = useState(0)
  const pendingLayoutChange = useRef<number | null>(null)

  // Ignore anything persisted that no longer matches a registered widget.
  const validPlaced = useMemo(() => {
    const source = Array.isArray(placed) ? placed : DEFAULT_PLACED
    return source.filter((p) => Boolean(p) && Boolean(p.layout) && p.type in WIDGETS)
  }, [placed])

  const layouts: ResponsiveLayouts = useMemo(
    () => ({
      lg: [
        ...PINNED_LAYOUTS,
        ...validPlaced.map((p) => ({
          i: p.id,
          x: p.layout.x,
          y: p.layout.y,
          w: p.layout.w,
          h: p.layout.h,
        })),
      ],
    }),
    [validPlaced],
  )

  const handleLayoutChange = (_current: readonly LayoutItem[], all: ResponsiveLayouts) => {
    const items = all.lg ?? []
    const next = validPlaced.map((p) => {
      const item = items.find((entry) => entry.i === p.id)
      if (!item) return p
      if (item.x === p.layout.x && item.y === p.layout.y && item.w === p.layout.w && item.h === p.layout.h) {
        return p
      }
      return { ...p, layout: { x: item.x, y: item.y, w: item.w, h: item.h } }
    })
    if (next.every((p, index) => p === validPlaced[index])) return

    if (pendingLayoutChange.current !== null) cancelAnimationFrame(pendingLayoutChange.current)
    pendingLayoutChange.current = requestAnimationFrame(() => {
      pendingLayoutChange.current = null
      setPlaced(next)
    })
  }

  const handleDrop = (_layout: Layout, item: LayoutItem | undefined, e: Event) => {
    if (!item) return
    const dataTransfer = (e as DragEvent).dataTransfer
    const raw = dataTransfer?.getData("application/x-widget-type")
    if (!raw || !(raw in WIDGETS)) return

    const type = raw as WidgetType
    const { defaultSize } = WIDGETS[type]

    setPlaced([
      ...validPlaced,
      {
        id: crypto.randomUUID(),
        type,
        layout: { x: item.x, y: item.y, w: defaultSize.w, h: defaultSize.h },
      },
    ])
    // Force a remount so a freshly dropped widget doesn't reconcile against a
    // stale layout snapshot (library timing race with newly added children).
    setGridInstanceKey((key) => key + 1)
  }

  return (
    <div ref={containerRef}>
      {mounted && (
        <ResponsiveGridLayout
          key={gridInstanceKey}
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 480 }}
          cols={{ lg: 12, md: 8, sm: 4 }}
          rowHeight={80}
          margin={[16, 16]}
          onLayoutChange={handleLayoutChange}
          dropConfig={{ enabled: true, defaultItem: { w: 2, h: 2 } }}
          onDrop={handleDrop}
        >
          {validPlaced.map((placed) => (
            <div key={placed.id}>
              <WidgetShell def={WIDGETS[placed.type]} />
            </div>
          ))}

          <StatCard
            key="energy-consumption"
            description="Energy Consumption"
            value="1,231 KWH"
            icon={MdEnergySavingsLeaf}
            trendValue="-5.20%"
            trendPositive
          />
          <StatCard
            key="peak-load"
            description="Peak Load"
            value="320 KWH"
            icon={FaGaugeHigh}
            trendValue="+2.82%"
            trendPositive={false}
          />
          <StatCard
            key="current-load"
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

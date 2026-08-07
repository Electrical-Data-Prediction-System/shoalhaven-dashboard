"use client"

import { ResponsiveGridLayout, useContainerWidth, type LayoutItem, type ResponsiveLayouts } from "react-grid-layout"
import { ResponsiveLine } from "@nivo/line"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import "react-grid-layout/css/styles.css"
import { StatCard } from "@/components/ui/stat-card"
import { ResponsiveBar } from "@nivo/bar"

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "./ui/button"
import { IoWalletSharp } from "react-icons/io5"
import { MdEnergySavingsLeaf } from "react-icons/md"
import { FaGaugeHigh } from "react-icons/fa6"
import { FaDollarSign } from "react-icons/fa"

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

const powerUsageData = [
  {
    id: "power",
    data: [
      { x: "Jan", y: 480 },
      { x: "Feb", y: 210 },
      { x: "Mar", y: 300 },
      { x: "Apr", y: 380 },
      { x: "May", y: 340 },
      { x: "Jun", y: 460 },
      { x: "Jul", y: 400 },
      { x: "Aug", y: 350 },
      { x: "Sep", y: 300 },
      { x: "Oct", y: 260 },
      { x: "Nov", y: 480 },
      { x: "Dec", y: 470 },
    ],
  },
]

const costOverviewData = [
  { month: "Jul", cost: 22 },
  { month: "Aug", cost: 18 },
  { month: "Sep", cost: 28 },
  { month: "Oct", cost: 20 },
  { month: "Nov", cost: 14 },
  { month: "Dec", cost: 26 },
]

const stationPowerUsageData = [
  { name: "Staion 1", KPI: "4,694", KWH: "340", bounceRate: "46.53%" },
  { name: "Staion 2", KPI: "3,985", KWH: "319", bounceRate: "46.53%" },
  { name: "Staion 3", KPI: "3,513", KWH: "294", bounceRate: "36.49%" },
  { name: "Staion 4", KPI: "2,050", KWH: "147", bounceRate: "50.87%" },
  { name: "Staion 5", KPI: "1,795", KWH: "190", bounceRate: "46.32%" },
]

export function DashboardGridDemo() {
  const [layouts, setLayouts] = useLocalStorage<ResponsiveLayouts>(STORAGE_KEY, defaultLayouts)
  const { width, containerRef, mounted } = useContainerWidth({
    measureBeforeMount: true,
  })

  const handleLayoutChange = (_currentLayout: readonly LayoutItem[], allLayouts: ResponsiveLayouts) => {
    setLayouts(allLayouts);
  }


  // Power usage data
  // Cost overview data
  // Station power usage data



  return (
    <div ref={containerRef}>
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
        >
          <div
            key="power-usage"
            className="flex flex-col rounded-xl border bg-card p-4 shadow-sm"
          >
            <h3 className="mb-2 text-sm font-semibold">Power Usage Overview</h3>
            <div className="flex-1">
              <ResponsiveLine
                data={powerUsageData}
                margin={{ top: 10, right: 20, bottom: 30, left: 40 }}
                enableArea
                colors={["#3b82f6"]}
                curve="monotoneX"
                axisBottom={{ tickSize: 0, tickPadding: 8 }}
                axisLeft={{ tickSize: 0, tickPadding: 8 }}
                enablePoints={false}
                enableGridX={false}
                useMesh
              />
            </div>
          </div>

          {/* energy cost*/}
          <StatCard
            key="energy-cost"
            description="Energy Cost"
            value="$2,473 KWH"
            icon={IoWalletSharp}
            trendValue="-3.48%"
            trendPositive
          />

          {/* energy consumption */}
          <StatCard
            key="energy-consumption"
            description="Energy Consumption"
            value="1,231 KWH"
            icon={MdEnergySavingsLeaf}
            trendValue="-5.20%"
            trendPositive
          />

          {/* peak load */}
          <StatCard
            key="peak-load"
            description="Peak Load"
            value="320 KWH"
            icon={FaGaugeHigh}
            trendValue="+2.82%"
            trendPositive={false}
          />

          {/* current load*/}
          <StatCard
            key="current-load"
            description="Total Revenue"
            value="$100,000"
            icon={FaDollarSign}
            trendValue="-8.12%"
            trendPositive
          />


          <div
            key="cost-overview"
            className="flex flex-col rounded-xl border bg-card p-4 shadow-sm"
          >
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


          <div
            key="station-power-usage"
            className="flex flex-col overflow-hidden rounded-xl border bg-card p-4 shadow-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Stations power usage</h3>
              <Button size="sm">See all</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Station Name</TableHead>
                  <TableHead>KPI</TableHead>
                  <TableHead>KWH</TableHead>
                  <TableHead className="text-right">Energy Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stationPowerUsageData.map((station) => (
                  <TableRow key={station.name}>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>{station.KPI}</TableCell>
                    <TableCell>{station.KWH}</TableCell>
                    <TableCell className="text-right">{station.bounceRate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </ResponsiveGridLayout>
      )}
    </div>
  )
}

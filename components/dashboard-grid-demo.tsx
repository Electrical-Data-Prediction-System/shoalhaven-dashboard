"use client"

import { ResponsiveGridLayout, useContainerWidth, type LayoutItem, type ResponsiveLayouts } from "react-grid-layout"
import { ResponsiveLine } from "@nivo/line"
import { useLocalStorage } from "@/hooks/useLocalStorage"
import { useRef, useState } from "react"
import "react-grid-layout/css/styles.css"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "./ui/badge"
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

const STORAGE_KEY = "layout-power"


// One "layout item" per grid box: x/y are grid-cell coordinates,
// w/h are how many columns/rows it spans. i must match a rendered child's key.
const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: "energy-cost", x: 0, y: 0, w: 2, h: 2 },
    { i: "energy-consumption", x: 2, y: 0, w: 2, h: 2 },
    { i: "peak-load", x: 4, y: 0, w: 2, h: 2 },
    { i: "current-load", x: 6, y: 0, w: 2, h: 2 },
    { i: "power-usage", x: 0, y: 2, w: 6, h: 4 },
    { i: "cost-overview", x: 6, y: 2, w: 2, h: 4 },
    { i: "station-power-usage", x: 0, y: 4, w: 4, h: 4 },
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
  { name: "Staion 1", KPI: "4,554", KWH: "344", bounceRate: "46.32%" },
  { name: "Staion 2", KPI: "4,554", KWH: "344", bounceRate: "46.32%" },
  { name: "Staion 3", KPI: "4,554", KWH: "344", bounceRate: "46.32%" },
  { name: "Staion 4", KPI: "4,554", KWH: "344", bounceRate: "46.32%" },
  { name: "Staion 5", KPI: "4,554", KWH: "344", bounceRate: "46.32%" },
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


          <Card className="@container/card" key="energy-cost">
            <CardHeader>
              <CardDescription>Energy Cost</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                $2,473 KWH
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <span className="text-green-400">-3.48%</span>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending down
              </div>
              <div className="text-muted-foreground">
                Since last month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card" key="energy-consumption">
            <CardHeader>
              <CardDescription>Energy Consumption</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                1,231 KWH
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <span className="text-green-400">-5.20%</span>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending down
              </div>
              <div className="text-muted-foreground">
                Since last month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card" key="peak-load">
            <CardHeader>
              <CardDescription>Peak Load</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                320 KWH
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <span className="text-red-400">+2.82%</span>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending up
              </div>
              <div className="text-muted-foreground">
                Since last month
              </div>
            </CardFooter>
          </Card>

          <Card className="@container/card" key="current-load">
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                $100,000
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <span className="text-green-400">-8.12%</span>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Trending down
              </div>
              <div className="text-muted-foreground">
                Since last month
              </div>
            </CardFooter>
          </Card>


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
                  <TableHead className="text-right">Bounce Rate</TableHead>
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

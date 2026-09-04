import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from "../ui/button"

const stationPowerUsageData = [
    { name: "Staion 1", KPI: "4,694", KWH: "340", bounceRate: "46.53%" },
    { name: "Staion 2", KPI: "3,985", KWH: "319", bounceRate: "46.53%" },
    { name: "Staion 3", KPI: "3,513", KWH: "294", bounceRate: "36.49%" },
    { name: "Staion 4", KPI: "2,050", KWH: "147", bounceRate: "50.87%" },
    { name: "Staion 5", KPI: "1,795", KWH: "190", bounceRate: "46.32%" },
  ]
  

export function StationTable(){
    return (
        <div
        className="flex h-full flex-col overflow-hidden rounded-xl border bg-card p-4 shadow-sm"
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
    )
}
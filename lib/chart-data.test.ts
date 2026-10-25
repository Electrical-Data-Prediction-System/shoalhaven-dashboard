import { describe, expect, it } from "vitest"
import { toChartRows, toMultiSeriesChartData } from "./chart-data"

describe("toChartRows", () => {
  it("converts an API series response into chart rows", () => {
    expect(
      toChartRows({
        series: [
          {
            name: "Meter 1",
            data: [
              { x: "2026-01-01T00:00:00Z", y: 12.5 },
              { x: "2026-01-01T01:00:00Z", y: 8 },
            ],
          },
          { name: "Meter 2", data: [{ x: "2026-01-01T00:00:00Z", y: 3 }] },
        ],
      }),
    ).toEqual([
      { x: "2026-01-01T00:00:00Z", kwh: 12.5, series: "Meter 1" },
      { x: "2026-01-01T01:00:00Z", kwh: 8, series: "Meter 1" },
      { x: "2026-01-01T00:00:00Z", kwh: 3, series: "Meter 2" },
    ])
  })

  it("converts meter totals into chart rows", () => {
    expect(
      toChartRows([
        { name: "Meter 1", KWH: 24 },
        { name: "Meter 2", KWH: 0 },
      ]),
    ).toEqual([
      { x: "Meter 1", kwh: 24 },
      { x: "Meter 2", kwh: 0 },
    ])
  })

  it("converts date rows with a value for each meter into chart series", () => {
    expect(
      toChartRows([
        { date: "2025-09-30T14:00:00", "meter-1": 528.89, "meter-2": 557.31 },
        { date: "2025-10-31T13:00:00", "meter-2": 2525.89, "meter-1": 2521.48 },
      ]),
    ).toEqual([
      { x: "2025-09-30T14:00:00", kwh: 528.89, series: "meter-1" },
      { x: "2025-09-30T14:00:00", kwh: 557.31, series: "meter-2" },
      { x: "2025-10-31T13:00:00", kwh: 2525.89, series: "meter-2" },
      { x: "2025-10-31T13:00:00", kwh: 2521.48, series: "meter-1" },
    ])
  })

  it("pivots meter rows into date-aligned chart data", () => {
    expect(toMultiSeriesChartData([
      { x: "2025-09-30", kwh: 10, series: "meter-1" },
      { x: "2025-09-30", kwh: 20, series: "meter-2" },
      { x: "2025-10-31", kwh: 25, series: "meter-1" },
    ])).toEqual({
      data: [
        { x: "2025-09-30", series0: 10, series1: 20 },
        { x: "2025-10-31", series0: 25 },
      ],
      series: [
        { name: "meter-1", key: "series0" },
        { name: "meter-2", key: "series1" },
      ],
    })
  })
})

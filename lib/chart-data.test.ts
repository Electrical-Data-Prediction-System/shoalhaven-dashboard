import { describe, expect, it } from "vitest"
import { toChartRows } from "./chart-data"

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
      { x: "2026-01-01T00:00:00Z", kwh: 12.5 },
      { x: "2026-01-01T01:00:00Z", kwh: 8 },
      { x: "2026-01-01T00:00:00Z", kwh: 3 },
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
})

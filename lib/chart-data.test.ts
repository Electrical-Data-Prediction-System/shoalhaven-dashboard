import { describe, expect, it } from "vitest"
import { complementColor } from "./chart-format"
import { downsample, mergeForecast, readingIntervalMinutes, toChartRows } from "./chart-data"

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

describe("mergeForecast", () => {
  const rows = [
    { x: "2026-01-01T00:00:00", kwh: 10 },
    { x: "2026-01-02T00:00:00", kwh: 12 },
  ]

  it("appends future points and joins the line at the last actual row", () => {
    expect(
      mergeForecast(rows, [
        { x: "2026-01-02T00:00:00", p10: 1, p50: 2, p90: 3 },
        { x: "2026-01-03T00:00:00", p10: 9, p50: 11, p90: 13 },
      ]),
    ).toEqual([
      { x: "2026-01-01T00:00:00", kwh: 10 },
      { x: "2026-01-02T00:00:00", kwh: 12, forecast: 12, band: [12, 12] },
      { x: "2026-01-03T00:00:00", forecast: 11, band: [9, 13] },
    ])
  })

  it("leaves rows untouched when no forecast point is in the future", () => {
    expect(mergeForecast(rows, [{ x: "2026-01-01T00:00:00Z", p10: 1, p50: 2, p90: 3 }])).toBe(rows)
  })
})

describe("complementColor", () => {
  it("flips the hue of a hex colour and falls back for anything else", () => {
    expect(complementColor("#217acc")).toBe("#cc7321")
    expect(complementColor("var(--primary)")).toBe("var(--color-brand-warning-500)")
  })
})

describe("downsample", () => {
  const rows = Array.from({ length: 1000 }, (_, i) => ({ x: String(i), kwh: i === 500 ? 999 : i % 10 }))

  it("keeps the first, last and spike rows while thinning to the threshold", () => {
    const sampled = downsample(rows, 100)

    expect(sampled).toHaveLength(100)
    expect(sampled[0]).toBe(rows[0])
    expect(sampled.at(-1)).toBe(rows.at(-1))
    expect(sampled).toContain(rows[500])
  })

  it("returns small data unchanged", () => {
    expect(downsample(rows.slice(0, 50), 100)).toHaveLength(50)
  })
})

describe("forecast scaling for raw readings", () => {
  const halfHourly = [
    { x: "2026-01-01T00:00:00", kwh: 5 },
    { x: "2026-01-01T00:30:00", kwh: 6 },
    { x: "2026-01-01T01:00:00", kwh: 7 },
  ]

  it("finds the reading interval", () => {
    expect(readingIntervalMinutes(halfHourly)).toBe(30)
    expect(readingIntervalMinutes(halfHourly.slice(0, 1))).toBeNull()
  })

  it("scales hourly forecast values down to one reading", () => {
    const merged = mergeForecast(halfHourly, [{ x: "2026-01-01T02:00:00", p10: 10, p50: 14, p90: 18 }], 0.5)

    expect(merged.at(-1)).toEqual({ x: "2026-01-01T02:00:00", forecast: 7, band: [5, 9] })
  })
})

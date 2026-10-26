import { describe, expect, it } from "vitest"
import { markerRadius, meterGroup, spreadOverlaps } from "./meter-map"

describe("meter map helpers", () => {
  it("groups meter types, with anything unknown as other", () => {
    expect(meterGroup("Sewage Pump Station")).toBe("pumping")
    expect(meterGroup("Holiday Haven")).toBe("leisure")
    expect(meterGroup("Nowra Landfill")).toBe("other")
  })

  it("sizes circles so area follows kWh", () => {
    const area = (kwh: number) => (markerRadius(kwh, 400, 0, 20) ** 2)

    expect(markerRadius(400, 400, 4, 22)).toBe(22)
    expect(markerRadius(0, 400, 4, 22)).toBe(4)
    expect(area(400) / area(100)).toBeCloseTo(4)
  })

  it("nudges meters that share a point and leaves the first one in place", () => {
    const points = [
      { id: "a", coordinates: [150.6, -34.8] as [number, number] },
      { id: "b", coordinates: [150.6, -34.8] as [number, number] },
      { id: "c", coordinates: [150.7, -34.9] as [number, number] },
    ]

    const [a, b, c] = spreadOverlaps(points)

    expect(a.coordinates).toEqual([150.6, -34.8])
    expect(b.coordinates).not.toEqual([150.6, -34.8])
    expect(Math.hypot(b.coordinates[0] - 150.6, b.coordinates[1] + 34.8)).toBeCloseTo(0.0015)
    expect(c.coordinates).toEqual([150.7, -34.9])
  })
})

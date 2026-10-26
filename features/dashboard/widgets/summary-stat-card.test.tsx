import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { percentChange, SummaryStatCard } from "./summary-stat-card"

const summary = {
  current: {
    month: "2025-12-01T00:00:00",
    totalKwh: 459496.3,
    busiestDay: { date: "2025-12-27", kwh: 19594.1 },
    wholesaleCost: 30298.84,
    pricedShare: 1,
  },
  previous: {
    month: "2025-11-01T00:00:00",
    totalKwh: 409339.4,
    busiestDay: { date: "2025-11-08", kwh: 17918.6 },
    wholesaleCost: 31979.35,
    pricedShare: 1,
  },
}

describe("SummaryStatCard", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("works out the change against last month", () => {
    expect(percentChange(110, 100)?.text).toBe("+10.0%")
    expect(percentChange(95, 100)?.text).toBe("-5.0%")
    expect(percentChange(5, 0)).toBeNull()
    expect(percentChange(null, 100)).toBeNull()
  })

  it("shows real usage and cost, sharing one request between cards", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(summary) })
    vi.stubGlobal("fetch", fetchMock)

    render(
      <>
        <SummaryStatCard kind="consumption" />
        <SummaryStatCard kind="cost" />
      </>,
    )

    expect(await screen.findByText(`${(459496).toLocaleString()} kWh`)).toBeTruthy()
    expect(screen.getByText("+12.3%")).toBeTruthy()
    // Cost went down, which is the good direction
    expect(screen.getByText("-5.3%").className).toContain("text-green-500")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

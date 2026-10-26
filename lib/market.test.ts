import { afterEach, describe, expect, it, vi } from "vitest"
import { GetMarketDailyProfile } from "./api"
import { formatNemDate, SEASONS, toSeason } from "./market"

describe("market helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("falls back to the whole year for unknown seasons", () => {
    expect(toSeason("winter")).toBe("winter")
    expect(toSeason("monsoon")).toBe("year")
    expect(toSeason(undefined)).toBe("year")
  })

  it("shows dates in NEM time, so a month starting at midnight +10 keeps its month", () => {
    // 1 Jan 2025 00:00 NEM is still 31 Dec in UTC
    expect(formatNemDate("2024-12-31T14:00:00", { month: "short", year: "numeric" })).toMatch(/Jan.*2025/)
  })

  it("sends each series and month as a repeated parameter", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([]) })
    vi.stubGlobal("fetch", fetchMock)

    await GetMarketDailyProfile(["price", "solar_rooftop"], SEASONS.winter.months)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/market/daily-profile?series=price&series=solar_rooftop&months=6&months=7&months=8",
      undefined,
    )
  })
})

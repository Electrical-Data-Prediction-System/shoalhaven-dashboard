import { afterEach, describe, expect, it, vi } from "vitest"
import type { WidgetFormConfig } from "@/features/dashboard/context/widget-context"
import { forecastGranularity, loadWidgetForecast } from "./widget-data"

const config: WidgetFormConfig = {
  name: "Usage",
  type: "line",
  dataMode: "aggregate",
  timePeriod: "day",
  meterIds: ["meter-1"],
  showForecast: true,
}

describe("forecastGranularity", () => {
  it("matches raw readings to hourly and daily buckets to daily forecasts", () => {
    expect(forecastGranularity({ ...config, dataMode: "readings", timePeriod: "latest" })).toBe("hour")
    expect(forecastGranularity(config)).toBe("day")
  })

  it("has no forecast for other charts or for more than one meter", () => {
    expect(forecastGranularity({ ...config, timePeriod: "month" })).toBeNull()
    expect(forecastGranularity({ ...config, type: "bar" })).toBeNull()
    expect(forecastGranularity({ ...config, meterIds: ["meter-1", "meter-2"] })).toBeNull()
  })
})

describe("loadWidgetForecast", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("requests the single meter's matching forecast", async () => {
    const forecast = { meterId: "meter-1", points: [] }
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(forecast) })
    vi.stubGlobal("fetch", fetchMock)

    await expect(loadWidgetForecast(config)).resolves.toBe(forecast)
    expect(fetchMock).toHaveBeenCalledWith("/api/meters/meter-1/forecast?granularity=day", undefined)
  })

  it("returns null when no forecast has been generated", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }))

    await expect(loadWidgetForecast(config)).resolves.toBeNull()
  })

  it("skips the request when the forecast is turned off", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    await expect(loadWidgetForecast({ ...config, showForecast: false })).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("dashboard API helpers", () => {
  beforeEach(() => {
    vi.stubEnv("API_INTERNAL_URL", "http://api.test")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it("serializes meter aggregate parameters and returns the response", async () => {
    const response = { series: [] }
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(response),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { GetAggregatedMeterPower } = await import("./api")
    const start = new Date("2026-01-01T00:00:00.000Z")
    const end = new Date("2026-01-02T00:00:00.000Z")

    await expect(GetAggregatedMeterPower("meter-1", start, end, "week")).resolves.toBe(response)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/meters/meter-1/aggregate-power?start=2026-01-01T00%3A00%3A00.000Z&end=2026-01-02T00%3A00%3A00.000Z&interval=week",
      undefined,
    )
  })

  it("serializes multiple meter ids as repeated query parameters", async () => {
    const response: never[] = []
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(response),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { GetAllAggregatedMeterPower } = await import("./api")

    await expect(
      GetAllAggregatedMeterPower(undefined, undefined, "month", ["meter-1", "meter-2"]),
    ).resolves.toBe(response)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/meters/power/aggregate-power?interval=month&meterIds=meter-1&meterIds=meter-2",
      undefined,
    )
  })

  it("requests raw meter power without forcing an aggregate interval", async () => {
    const response: never[] = []
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(response),
    })
    vi.stubGlobal("fetch", fetchMock)

    const { GetAllAggregatedMeterPower } = await import("./api")

    await expect(
      GetAllAggregatedMeterPower(undefined, undefined, undefined, ["meter-1"], true),
    ).resolves.toBe(response)
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/meters/power/raw-power?meterIds=meter-1",
      undefined,
    )
  })

  it("reports HTTP errors instead of returning a success-shaped value", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    const { ApiFetch } = await import("./api")

    await expect(ApiFetch("/meters")).rejects.toThrow("API error 503: /meters")
  })
})

import { beforeEach, describe, expect, it, vi } from "vitest"
import { GetAllAggregatedMeterPower, GetLatestReadingTimestamp } from "@/lib/api"
import type { WidgetFormConfig } from "@/features/dashboard/context/widget-context"
import { loadWidgetData } from "./widget-data"

vi.mock("@/lib/api", () => ({
  GetAllAggregatedMeterPower: vi.fn(),
  GetLatestReadingTimestamp: vi.fn(),
  GetReadingsBetween: vi.fn(),
}))

const config: WidgetFormConfig = {
  name: "Raw readings",
  type: "line",
  dataMode: "readings",
  timePeriod: "month",
  meterIds: ["meter-1"],
}

describe("loadWidgetData", () => {
  beforeEach(() => {
    vi.mocked(GetAllAggregatedMeterPower).mockReset()
    vi.mocked(GetAllAggregatedMeterPower).mockResolvedValue([
      { date: "2026-01-03T11:00:00.000Z", "meter-1": 3 },
    ])
    vi.mocked(GetLatestReadingTimestamp).mockResolvedValue(null)
  })

  it("loads raw meter-power rows for only the selected meters", async () => {
    await expect(loadWidgetData(config)).resolves.toEqual([
      { x: "2026-01-03T11:00:00.000Z", kwh: 3, series: "meter-1" },
    ])

    expect(GetAllAggregatedMeterPower).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      ["meter-1"],
      true,
    )
  })

  it("loads aggregate data using its selected bucket interval, without raw mode", async () => {
    await expect(loadWidgetData({ ...config, dataMode: "aggregate", timePeriod: "week" })).resolves.toEqual([
      { x: "2026-01-03T11:00:00.000Z", kwh: 3, series: "meter-1" },
    ])

    expect(GetAllAggregatedMeterPower).toHaveBeenCalledWith(
      undefined,
      undefined,
      "week",
      ["meter-1"],
    )
  })

  it("loads raw readings from the day before the latest selected-meter timestamp", async () => {
    vi.mocked(GetLatestReadingTimestamp)
      .mockResolvedValueOnce("2026-01-02T04:00:00.000Z")
      .mockResolvedValueOnce("2026-01-05T12:30:00.000Z")

    await expect(loadWidgetData({
      ...config,
      timePeriod: "latest",
      meterIds: ["meter-1", "meter-2"],
    })).resolves.toEqual([
      { x: "2026-01-03T11:00:00.000Z", kwh: 3, series: "meter-1" },
    ])

    expect(GetLatestReadingTimestamp).toHaveBeenCalledTimes(2)
    expect(GetAllAggregatedMeterPower).toHaveBeenCalledWith(
      new Date("2026-01-04T12:30:00.000Z"),
      new Date("2026-01-05T12:30:00.000Z"),
      undefined,
      ["meter-1", "meter-2"],
      true,
    )
  })

  it("returns no readings when none of the selected meters has a timestamp", async () => {
    await expect(loadWidgetData({ ...config, timePeriod: "latest" })).resolves.toEqual([])
    expect(GetAllAggregatedMeterPower).not.toHaveBeenCalled()
  })
})

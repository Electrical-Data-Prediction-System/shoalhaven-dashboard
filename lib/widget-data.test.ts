import { beforeEach, describe, expect, it, vi } from "vitest"
import { GetAllAggregatedMeterPower } from "@/lib/api"
import type { WidgetFormConfig } from "@/contexts/widget-context"
import { loadWidgetData } from "./widget-data"

vi.mock("@/lib/api", () => ({
  GetAllAggregatedMeterPower: vi.fn(),
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
})

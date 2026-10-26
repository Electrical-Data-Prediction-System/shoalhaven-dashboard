import { describe, expect, it } from "vitest"
import { formatChartDate, formatTableDate } from "./chart-format"

const utcDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
})

describe("raw-reading date formatting", () => {
  it("does not shift raw readings onto another date", () => {
    const timestamp = "2026-12-30T23:00:00+11:00"
    const expected = utcDateTimeFormatter.format(new Date(timestamp))

    expect(formatChartDate(timestamp, "readings", "day")).toBe(expected)
  })

  it("parses API timestamps without an offset as UTC", () => {
    const expectedDate = new Date("2026-12-30T12:00:00Z")
    const expected = utcDateTimeFormatter.format(expectedDate)

    expect(formatChartDate("2026-12-30 12:00:00.123456", "readings", "day")).toBe(expected)
    expect(formatTableDate("2026-12-30 12:00:00.123456", "readings", "day")).toContain("30 Dec")
  })

  it("formats one-day raw chart labels as HH:MM", () => {
    expect(formatChartDate("2026-12-30T23:07:00Z", "readings", "day")).toBe("23:07")
  })
})

describe("aggregate date formatting", () => {
  it("keeps aggregate buckets aligned to the Sydney calendar", () => {
    const sydneyFormatter = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "Australia/Sydney",
    })
    const bucketDate = "2026-12-30T13:00:00Z"

    expect(formatChartDate(bucketDate, "aggregate", "day")).toBe(
      sydneyFormatter.format(new Date(bucketDate)),
    )
    expect(formatTableDate(bucketDate, "aggregate", "day")).toBe(
      new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Australia/Sydney",
      }).format(new Date(bucketDate)),
    )
  })
})

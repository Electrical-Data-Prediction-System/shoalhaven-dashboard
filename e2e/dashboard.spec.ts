import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === "/api/meters" && url.searchParams.has("location")) {
      await route.fulfill({
        json: [
          {
            _id: "meter-1",
            location: {
              fullAddress: "10 Main Street, Nowra NSW 2541",
              street: "10 Main Street",
              postcode: "2541",
              place: "Nowra",
              region: "NSW",
              country: "Australia",
            },
            type: "electricity",
            unit: "kWh",
          },
        ],
      })
      return
    }

    await route.fulfill({ json: { series: [] } })
  })
})

test("shows the dashboard and its station data", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByText("HYDROCHART")).toBeVisible()
  await expect(page.getByRole("main").getByText("Energy Consumption")).toBeVisible()
  await expect(page.getByText("Station Name")).toBeVisible()
  await expect(page.getByText("Staion 1")).toBeVisible()
})

test("opens the chart form and searches for a meter", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Create Chart" }).click()
  await expect(page.getByRole("heading", { name: "Create chart" })).toBeVisible()

  const locationInput = page.getByLabel("Search location")
  const searchResponse = page.waitForResponse((response) => {
    const url = new URL(response.url())
    return url.pathname === "/api/meters" && url.searchParams.get("location") === "Nowra"
  })
  await locationInput.fill("Nowra")
  await searchResponse
  await page.getByLabel("Meter").click()
  await expect(page.getByRole("option", { name: /10 Main Street, Nowra/ })).toBeVisible()
})

test("creates a daily chart with a forecast overlay", async ({ page }) => {
  await page.route("**/api/meters/**", async (route) => {
    const url = new URL(route.request().url())
    if (url.pathname === "/api/meters") return route.fallback()
    if (url.pathname.endsWith("/forecast")) {
      await route.fulfill({
        json: {
          meterId: "meter-1",
          granularity: "day",
          model: "timestral-5M",
          generatedAt: "2026-01-04T00:00:00",
          anchor: "2026-01-02T13:00:00",
          points: [
            { x: "2026-01-02T13:00:00", p10: 9, p50: 11, p90: 13 },
            { x: "2026-01-03T13:00:00", p10: 10, p50: 12, p90: 14 },
          ],
          backtest: { horizon: 30, modelMae: 1, baselineMae: 2, modelMape: 1.2, baselineMape: 2.2 },
        },
      })
      return
    }
    if (url.pathname === "/api/meters/power/aggregate-power") {
      // Charts load through the multi-meter route: one row per date, one column per meter
      await route.fulfill({
        json: [
          { date: "2025-12-31T13:00:00", "meter-1": 10 },
          { date: "2026-01-01T13:00:00", "meter-1": 12 },
          { date: "2026-01-02T13:00:00", "meter-1": 11 },
        ],
      })
      return
    }
    await route.fallback()
  })

  await page.goto("/")
  await page.getByRole("button", { name: "Create Chart" }).click()
  await page.getByLabel("Chart name").fill("Daily usage")
  await page.getByLabel("Chart type").click()
  await page.getByRole("option", { name: "Line" }).click()
  await page.getByLabel("Search location").fill("Nowra")
  await page.getByLabel("Meters").click()
  await page.getByRole("option", { name: /10 Main Street, Nowra/ }).click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Bucket interval").click()
  await page.getByRole("option", { name: "Every day" }).click()
  await page.getByLabel("Show forecast").check()
  await page.getByRole("button", { name: "Create chart", exact: true }).click()

  await expect(page.getByText("Forecast →")).toBeVisible()
  await page.getByRole("button", { name: "Maximize Daily usage" }).click()
  await expect(page.getByText(/1\.2% average error, vs 2\.2%/)).toBeVisible()
})

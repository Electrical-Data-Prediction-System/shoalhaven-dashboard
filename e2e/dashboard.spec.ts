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

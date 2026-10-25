import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ModalProvider } from "@/components/forms/modal"
import { WidgetProvider, type CreatedWidget } from "@/features/dashboard/context/widget-context"
import { GetMeter } from "@/lib/api"
import WidgetForm from "./create-widget"

vi.mock("@/lib/api", () => ({
  GetMeter: vi.fn(),
  SearchMetersByLocation: vi.fn(),
}))

const widget: CreatedWidget = {
  id: "existing-chart",
  name: "Existing chart",
  type: "area",
  dataMode: "readings",
  timePeriod: "day",
  meterIds: ["meter-1"],
}

describe("WidgetForm", () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.clearAllMocks()
  })

  it("does not request meter details when editing and offers the latest readings range", async () => {
    render(
      <ModalProvider>
        <WidgetProvider>
          <WidgetForm initialWidget={widget} />
        </WidgetProvider>
      </ModalProvider>,
    )

    expect(screen.getByRole("heading", { name: "Edit chart" })).toBeTruthy()
    expect(screen.getByText("1 meter selected")).toBeTruthy()
    expect(screen.queryByText(/API error/)).toBeNull()
    expect(GetMeter).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("combobox", { name: "Readings range" }))
    expect(await screen.findByRole("option", { name: "Most recent day" })).toBeTruthy()
  })

  it("keeps the most recent day range selected when editing", async () => {
    render(
      <ModalProvider>
        <WidgetProvider>
          <WidgetForm initialWidget={{ ...widget, timePeriod: "latest" }} />
        </WidgetProvider>
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole("combobox", { name: "Readings range" }))
    const latestOption = await screen.findByRole("option", { name: "Most recent day" })
    expect(latestOption.getAttribute("aria-selected")).toBe("true")
  })
})

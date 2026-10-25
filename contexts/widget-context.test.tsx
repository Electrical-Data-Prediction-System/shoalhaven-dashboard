import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { WidgetProvider, useWidgetContext, type WidgetFormConfig } from "./widget-context"

const config: WidgetFormConfig = {
  name: "Energy use",
  type: "line",
  dataMode: "aggregate",
  timePeriod: "month",
  meterIds: ["meter-1"],
}
const CREATED_WIDGETS_STORAGE_KEY = "demo-dashboard.createdWidgets"

function ContextHarness() {
  const { createdWidgets, onCreateWidget, updateCreatedWidget, deleteCreatedWidget } = useWidgetContext()
  const widget = createdWidgets[0]

  return (
    <div>
      <button onClick={() => onCreateWidget(config)}>Create widget</button>
      {widget && (
        <>
          <output>{widget.name}</output>
          <button onClick={() => updateCreatedWidget(widget.id, { ...config, name: "Updated energy use" })}>
            Update widget
          </button>
          <button onClick={() => deleteCreatedWidget(widget.id)}>Delete widget</button>
        </>
      )}
    </div>
  )
}

describe("WidgetProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal("crypto", { randomUUID: () => "widget-1" })
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
  })

  it("creates, updates, deletes, and persists widgets", () => {
    render(
      <WidgetProvider>
        <ContextHarness />
      </WidgetProvider>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Create widget" }))
    expect(screen.getByText("Energy use")).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(CREATED_WIDGETS_STORAGE_KEY) ?? "[]")).toMatchObject([
      { id: "widget-1", name: "Energy use", meterIds: ["meter-1"] },
    ])

    fireEvent.click(screen.getByRole("button", { name: "Update widget" }))
    expect(screen.getByText("Updated energy use")).toBeTruthy()
    expect(JSON.parse(localStorage.getItem(CREATED_WIDGETS_STORAGE_KEY) ?? "[]")[0].name).toBe("Updated energy use")

    fireEvent.click(screen.getByRole("button", { name: "Delete widget" }))
    expect(screen.queryByText("Updated energy use")).toBeNull()
    expect(JSON.parse(localStorage.getItem(CREATED_WIDGETS_STORAGE_KEY) ?? "[]")).toEqual([])
  })
})

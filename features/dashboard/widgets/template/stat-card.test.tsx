import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Zap } from "lucide-react"
import { StatCard } from "./stat-card"

describe("StatCard", () => {
  it("shows its metric, trend, and footer", () => {
    render(
      <StatCard
        value="1,231 KWH"
        icon={Zap}
        trendValue="-5.20%"
        footerText="Compared with last month"
      />,
    )

    expect(screen.getByText("1,231 KWH")).toBeTruthy()
    expect(screen.getByText("-5.20%")).toBeTruthy()
    expect(screen.getByText("Compared with last month")).toBeTruthy()
  })
})

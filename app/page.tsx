import { DashboardGridDemo } from "@/components/dashboard-grid-demo";
import { FormatPowerData } from "@/lib/format-data";
import { MonthRange } from "@/lib/month-format";

const MONTHS = MonthRange(2025, 1, 10);

export default async function Home() {
  const powerUsageData = await FormatPowerData(MONTHS);

  return (
    <div className="relative">
      <div
        className="absolute inset-x-0 top-0 h-90"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
      <div className="relative p-4 pb-8">
        <DashboardGridDemo powerUsageData={powerUsageData} />
      </div>
    </div>
  );
}

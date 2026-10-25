import { DashboardGrid } from "@/features/dashboard/components/dashboard-grid";

export default function Home() {
  return (
    <div className="relative">
      <div
        className="absolute inset-x-0 top-0 h-90"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
      <div className="relative p-4 pb-8">
        <DashboardGrid />
      </div>
    </div>
  );
}

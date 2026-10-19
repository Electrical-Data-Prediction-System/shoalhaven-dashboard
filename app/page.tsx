import { DashboardGrid } from "@/components/dashboard-refactored";
import WidgetForm from "@/components/forms/create-widget";
import Modal, { ModalProvider } from "@/components/forms/modal";

export default function Home() {
  return (
    <ModalProvider>
    <div className="relative">
      <div
        className="absolute inset-x-0 top-0 h-90"
        style={{ backgroundImage: "var(--gradient-primary)" }}
      />
      <div className="relative p-4 pb-8">
        <DashboardGrid />
      </div>
    </div>
    <div id="modal-root"></div>
        <Modal />
    </ModalProvider>
  );
}

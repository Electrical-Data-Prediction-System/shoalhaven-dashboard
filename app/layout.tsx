import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import Modal, { ModalProvider } from "@/components/forms/modal";
import { WidgetProvider } from "@/features/dashboard/context/widget-context";

const roboto = Roboto({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hydrochart",
  description: "Your dashboard, your data, your insights",
  icons: {
    icon: '/hydrochart-favicon.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ModalProvider>
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", roboto.variable)}
    >
      <body>
      <SidebarProvider>
        <WidgetProvider>
          <AppSidebar />
          <main className="min-w-0 flex-1">
            {/* <SidebarTrigger /> */}
            {children}
          </main>
          <div id="modal-root" />
          <Modal />
        </WidgetProvider>
      </SidebarProvider>
      </body>
    </html>
        </ModalProvider>
  );
}

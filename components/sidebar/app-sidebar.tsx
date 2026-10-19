"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Settings,
  Waves,
  Zap,
  Droplet,
  Plus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

import { SidebarMain } from "./sidebar-main"
import type { WidgetType } from "@/components/widget/widgets"
import { useModal } from "../forms/modal"
import WidgetForm from "../forms/create-widget"

const navMain = [
  {
    title: "Power",
    url: "/power",
    icon: Zap,
    isActive: true,
    items: [
      {
        title: "Energy Cost",
        url: "#",
        widgetType: "energy-cost" as const satisfies WidgetType,
      },
      {
        title: "Energy Consumption",
        url: "#",
        widgetId: "energy-consumption"
      },
      {
        title: "Peak Load",
        url: "#",
        widgetId: "peak-load"
      },
      {
        title: "Total Revenue",
        url: "#",
        widgetId: "current-load"
      },
      {
        title: "Power Usage Overview",
        url: "#",
        widgetType: "meter-power-usage" as const satisfies WidgetType,
        widgetId: "meter-power-usage"
      },
      {
        title: "Cost Overview",
        url: "#",
      },
      {
        title: "Station Usage",
        url: "#",
        widgetType: "station-power-usage" as const satisfies WidgetType,
        widgetId: "station-power-usage"
      },
    ],
  },
  {
    title: "Water",
    url: "/water",
    icon: Droplet,
    items: [
      {
        title: "Widget 1",
        url: "#",
      },
      {
        title: "Widget 2",
        url: "#",
      },
      {
        title: "Widget 3",
        url: "#",
      },
    ],
  },
  {
    title: "Sewer",
    url: "/sewer",
    icon: Droplet,
    items: [
      {
        title: "Widget 4",
        url: "#",
      },
      {
        title: "Widget 5",
        url: "#",
      },
      {
        title: "Widget 6",
        url: "#",
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { openModal, closeModal, isOpen } = useModal();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center px-2 py-1.5">
          <span className="text-lg font-bold tracking-wide">HYDROCHART</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMain items={navMain}></SidebarMain>
      </SidebarContent>

  
        <SidebarFooter>
          <SidebarMenu>

            <SidebarMenuItem>
              <SidebarMenuButton className="cursor-pointer" onClick={() => openModal(<WidgetForm />)}>
                <Plus />
                <span>Create Widget</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/logout" />}>
                <LogOut />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/settings" />}>
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

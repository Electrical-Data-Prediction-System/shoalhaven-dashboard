"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Settings,
  Waves,
  Zap,
  Droplet,
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
      },
      {
        title: "Energy Consumption",
        url: "#",
      },
      {
        title: "Peak Load",
        url: "#",
      },
      {
        title: "Total Revenue",
        url: "#",
      },
      {
        title: "Power Usage Overview",
        url: "#",
      },
      {
        title: "Cost Overview",
        url: "#",
      },
      {
        title: "Station Usage",
        url: "#",
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

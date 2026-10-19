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
import { useModal } from "../forms/modal"
import WidgetForm from "../forms/create-widget"

import { WIDGETS } from "@/components/widget/widgets"
import { useWidgetContext } from "@/contexts/widget-context"

const otherSections = [
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


  const { placed, createdWidgets } = useWidgetContext();

  const powerItems = [
    ...placed
      .filter((p) => p.type in WIDGETS)
      .map((p) => ({ title: WIDGETS[p.type].title, url: "#", widgetId: p.id})),
    ...createdWidgets.map((w) => ({ title: w.name, url: "#", widgetId: w.id}))
  ]

  const navMain = [
    { title: "Power", url: "#", icon: Zap, isActive: true, items: powerItems},
    ...otherSections
  ]

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
                <span>Create Chart</span>
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

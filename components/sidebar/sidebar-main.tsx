"use client"

import Link from "next/link"
import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import type { WidgetType } from "@/components/widget/widgets"
import { useWidgetContext } from "@/contexts/widget-context"

export function SidebarMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      // Kind of widget to create when this item is dragged onto the grid
      widgetType?: WidgetType
      // Placed widget to highlight when this item is double-clicked
      widgetId?: string
    }[]
  }[]
}) {
  const { highlight } = useWidgetContext()


  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
            render={<SidebarMenuItem />}
          >
            <CollapsibleTrigger
              render={
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              }
            />
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.items?.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      render={<Link href={subItem.url} />}
                      draggable={!!subItem.widgetType}
                      unselectable={subItem.widgetType ? "on" : undefined}
                      className={subItem.widgetType ? "cursor-grab active:cursor-grabbing" : undefined}
                      onDragStart={
                        subItem.widgetType
                          ? (e) => e.dataTransfer.setData("application/x-widget-type", subItem.widgetType!)
                          : undefined
                      }
                      onDoubleClick={(e) => {
                        if(!subItem.widgetId) return
                        e.preventDefault()
                        highlight(subItem.widgetId)
                      }}
                    >
                      <span>{subItem.title}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
import type { IconType } from "react-icons"

import { cn } from "@/lib/utils"

type StatCardProps = {
  value: string
  icon: IconType
  trendValue: string
  trendPositive?: boolean
  footerText?: string
  className?: string
}

/** Stat content only: the widget shell supplies the card frame and the title. */
export function StatCard({
  value,
  icon: Icon,
  trendValue,
  trendPositive = true,
  footerText = "Since last month",
  className,
}: StatCardProps) {
  return (
    <div className={cn("@container/card flex h-full flex-col gap-1", className)}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </span>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-secondary-700 text-white">
          <Icon className="size-5" />
        </div>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
        <span className={cn("font-medium", trendPositive ? "text-green-500" : "text-red-500")}>
          {trendValue}
        </span>
        <span className="text-muted-foreground">{footerText}</span>
      </div>
    </div>
  )
}

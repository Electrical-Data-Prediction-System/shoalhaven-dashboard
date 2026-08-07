import type * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = React.ComponentProps<typeof Card> & {
  description: string
  value: string
  icon: LucideIcon
  trendValue: string
  trendPositive?: boolean
  footerText?: string
}

export function StatCard({
  description,
  value,
  icon: Icon,
  trendValue,
  trendPositive = true,
  footerText = "Since last month",
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("@container/card", className)} {...props}>
      <CardHeader className="flex-row items-center justify-between">
        
        <CardDescription>{description}</CardDescription>
        <div className="flex w-full items-center justify-between gap-10">
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {value}
          </CardTitle>
        
          <div className="absolute right-6 top-1/3 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg bg-brand-secondary-700 text-white">
            <Icon className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardFooter className="gap-1.5 text-sm flex-grow-1">
        <span className={trendPositive ? "font-medium text-green-500" : "font-medium text-red-500"}>
          {trendValue}
        </span>
        <span className="text-muted-foreground">{footerText}</span>
      </CardFooter>
    </Card>
  )
}



import type * as React from "react"
import type { IconType } from "react-icons"

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
  children,
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
        
          <div className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-lg bg-brand-secondary-700 text-white">
            <Icon className="size-5" />
          </div>
        </div>
      </CardHeader>
<<<<<<< HEAD
      <CardFooter className="flex-col items-start gap-1.5 text-sm flex-grow-1">
=======
      <CardFooter className="gap-1.5 text-sm flex-grow-1">
>>>>>>> fdde18fd661732be7c92bb4279427436d577839c
        <span className={trendPositive ? "font-medium text-green-500" : "font-medium text-red-500"}>
          {trendValue}
        </span>
        <span className="text-muted-foreground">{footerText}</span>
      </CardFooter>
      {children}
    </Card>
  )
}



"use client"

import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"

// Leaflet touches `window` as soon as it's imported, so it can only load in the browser
export const MeterMapWidget = dynamic(() => import("./meter-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
})

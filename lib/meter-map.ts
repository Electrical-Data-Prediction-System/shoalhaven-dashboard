import type { MeterMapPoint } from "@/lib/api"

export type MeterGroup = "pumping" | "treatment" | "leisure" | "civic" | "other"

export const METER_GROUPS: Record<MeterGroup, { label: string; color: string }> = {
  pumping: { label: "Water & sewer pumping", color: "#217acc" },
  treatment: { label: "Treatment plants", color: "#e8890c" },
  leisure: { label: "Leisure & holiday parks", color: "#16a085" },
  civic: { label: "Admin & civic", color: "#8e5bd8" },
  other: { label: "Other", color: "#c0392b" },
}

export const NO_DATA_COLOR = "#9ca3af"

// The 13 meter types folded into 5 groups, so each colour stays easy to tell apart
const TYPE_GROUPS: Record<string, MeterGroup> = {
  "Water Pump Station": "pumping",
  "Sewage Pump Station": "pumping",
  "Sewage Treatment Works": "treatment",
  "Water Treatment Plant": "treatment",
  "Leisure Centre": "leisure",
  "Holiday Haven": "leisure",
  "Admin Centre": "civic",
  "Civic Centre": "civic",
}

export function meterGroup(type: string): MeterGroup {
  return TYPE_GROUPS[type] ?? "other"
}

export function markerRadius(kwh: number, maxKwh: number, min = 4, max = 22) {
  if (maxKwh <= 0) return min
  return min + (max - min) * Math.sqrt(Math.max(kwh, 0) / maxKwh)
}

export function spreadOverlaps<T extends Pick<MeterMapPoint, "coordinates">>(points: T[], offset = 0.0015): T[] {
  const seen = new Map<string, number>()

  return points.map((point) => {
    const key = point.coordinates.join(",")
    const index = seen.get(key) ?? 0
    seen.set(key, index + 1)
    if (index === 0) return point

    const angle = (index * Math.PI * 2) / 6
    const [lon, lat] = point.coordinates
    return { ...point, coordinates: [lon + offset * Math.cos(angle), lat + offset * Math.sin(angle)] }
  })
}

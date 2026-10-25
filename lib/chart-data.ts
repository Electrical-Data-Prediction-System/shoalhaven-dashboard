export type ApiPoint = { x: string, y: number }
export type ApiSeries = { series: { name: string; data: ApiPoint[] }[] }
export type ApiMeterPower = { name: string; KWH: number }
export type ApiPowerResponse = ApiSeries | ApiMeterPower[]
export type ChartRow = { x: string; kwh: number }
/** A chart row that may hold actual usage, the forecast median and its p10-p90 band */
export type ForecastChartRow = { x: string; kwh?: number; forecast?: number; band?: [number, number] }
export type ForecastPoint = { x: string; p10: number; p50: number; p90: number }

export const toChartRows = (response: ApiPowerResponse): ChartRow[] => {
  if (Array.isArray(response)) {
    return response.map(({ name, KWH }) => ({ x: name, kwh: KWH }))
  }

  if (response && Array.isArray(response.series)) {
    return response.series.flatMap(({ data }) =>
      data.map(({ x, y }) => ({ x: String(x), kwh: y })),
    )
  }

  throw new TypeError("Expected API response to contain a series array or meter rows")
}

const toTime = (value: string) => Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}Z`)

/** Most common gap between consecutive rows, in minutes (e.g. 30 for half-hourly readings) */
export const readingIntervalMinutes = (rows: ChartRow[]): number | null => {
  const counts = new Map<number, number>()
  for (let i = 1; i < Math.min(rows.length, 200); i++) {
    const gap = Math.round((toTime(rows[i].x) - toTime(rows[i - 1].x)) / 60_000)
    if (gap > 0) counts.set(gap, (counts.get(gap) ?? 0) + 1)
  }

  let best: number | null = null
  for (const [gap, count] of counts) {
    if (best === null || count > counts.get(best)!) best = gap
  }
  return best
}

/**
 * Appends forecast points after the actual rows. The last actual row also starts
 * the forecast line so the two join up, and points that overlap actual data are dropped.
 * `scale` converts forecast values to the rows' unit, e.g. 0.5 turns kWh per hour into kWh per half-hour reading.
 */
export const mergeForecast = (rows: ChartRow[], points: ForecastPoint[], scale = 1): ForecastChartRow[] => {
  if (!rows.length || !points.length) return rows

  const last = rows[rows.length - 1]
  const lastTime = toTime(last.x)
  const future = points
    .filter((point) => toTime(point.x) > lastTime)
    .map(({ x, p10, p50, p90 }): ForecastChartRow => ({
      x,
      forecast: p50 * scale,
      band: [p10 * scale, p90 * scale],
    }))

  if (!future.length) return rows

  return [
    ...rows.slice(0, -1),
    { ...last, forecast: last.kwh, band: [last.kwh, last.kwh] },
    ...future,
  ]
}

/**
 * Thins rows down to `threshold` points for drawing, using Largest-Triangle-Three-Buckets.
 * It keeps real readings that preserve the line's shape (including spikes), plus the first and last row.
 */
export const downsample = <T extends ChartRow>(rows: T[], threshold = 300): T[] => {
  if (rows.length <= threshold || threshold < 3) return rows

  const sampled = [rows[0]]
  const bucketSize = (rows.length - 2) / (threshold - 2)
  let previous = 0

  for (let bucket = 0; bucket < threshold - 2; bucket++) {
    // Average of the next bucket, used as the triangle's third corner
    const nextStart = Math.floor((bucket + 1) * bucketSize) + 1
    const nextEnd = Math.min(Math.floor((bucket + 2) * bucketSize) + 1, rows.length)
    let avgX = 0
    let avgY = 0
    for (let i = nextStart; i < nextEnd; i++) {
      avgX += i
      avgY += rows[i].kwh
    }
    const count = Math.max(nextEnd - nextStart, 1)
    avgX /= count
    avgY /= count

    // Keep the point in this bucket that forms the biggest triangle
    const start = Math.floor(bucket * bucketSize) + 1
    const end = Math.floor((bucket + 1) * bucketSize) + 1
    let best = start
    let bestArea = -1
    for (let i = start; i < end; i++) {
      const area = Math.abs(
        (previous - avgX) * (rows[i].kwh - rows[previous].kwh) - (previous - i) * (avgY - rows[previous].kwh),
      )
      if (area > bestArea) {
        bestArea = area
        best = i
      }
    }

    sampled.push(rows[best])
    previous = best
  }

  sampled.push(rows[rows.length - 1])
  return sampled
}

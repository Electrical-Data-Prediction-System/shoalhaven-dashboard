export type ApiPoint = { x: string, y: number }
export type ApiSeries = { series: { name: string; data: ApiPoint[] }[] }
export type ApiMeterPower = { name: string; KWH: number }
export type ApiPowerResponse = ApiSeries | ApiMeterPower[]
export type ChartRow = { x: string; kwh: number }

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

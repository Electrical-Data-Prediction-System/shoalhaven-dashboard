export type ApiPoint = { x: string, y: number }
export type ApiSeries = { series: { name: string; data: ApiPoint[] }[] }
export type ApiMeterPower = { name: string; KWH: number }
export type ApiMeterPowerRow = { date: string; [meterId: string]: string | number }
export type ApiPowerResponse = ApiSeries | ApiMeterPower[] | ApiMeterPowerRow[]
export type ChartRow = { x: string; kwh: number; series?: string }
export const CHART_SERIES_COLORS = ["#217acc", "#f28c28", "#155e9c", "#8e5ea2", "#2f855a", "#c53030"]

export const toChartRows = (response: ApiPowerResponse): ChartRow[] => {
  if (Array.isArray(response)) {
    if (response.length > 0 && "date" in response[0]) {
      return (response as ApiMeterPowerRow[]).flatMap(({ date, ...meterValues }) =>
        Object.entries(meterValues)
          .filter((entry): entry is [string, number] => typeof entry[1] === "number")
          .map(([series, kwh]) => ({ x: date, kwh, series })),
      )
    }

    return (response as ApiMeterPower[]).map(({ name, KWH }) => ({ x: name, kwh: KWH }))
  }

  if (response && Array.isArray(response.series)) {
    return response.series.flatMap(({ name, data }) =>
      data.map(({ x, y }) => ({ x: String(x), kwh: y, series: name })),
    )
  }

  throw new TypeError("Expected API response to contain a series array or meter rows")
}

export type ChartSeries = { key: string; name: string }
export type MultiSeriesChartData = {
  data: ({ x: string } & Record<string, string | number>)[]
  series: ChartSeries[]
}

export function toMultiSeriesChartData(rows: ChartRow[]): MultiSeriesChartData {
  const names = [...new Set(rows.map(({ series }) => series ?? "kwh"))]
  const series = names.map((name, index) => ({ name, key: `series${index}` }))
  const seriesByName = new Map(series.map((entry) => [entry.name, entry]))
  const dataByDate = new Map<string, ({ x: string } & Record<string, string | number>)>()

  for (const row of rows) {
    const entry = seriesByName.get(row.series ?? "kwh")
    if (!entry) continue

    let point = dataByDate.get(row.x)
    if (!point) {
      point = { x: row.x }
      dataByDate.set(row.x, point)
    }
    point[entry.key] = Number(point[entry.key] ?? 0) + row.kwh
  }

  return {
    data: [...dataByDate.values()],
    series,
  }
}

// date: datetime

//     __pydantic_extra__: dict[str, float] = Field(init=False)
//     model_config = ConfigDict(extra="allow")
import { BarDatum } from "@nivo/bar";

export type NivoSerie = { id: string, data: { x: string, y: number }[] }
export type ApiPoint = { x: string, y: number }
export type ApiSeries = { series: { name: string; data: ApiPoint[] }[] }
export type ApiMeterPower = { name: string; KWH: number }
export type ApiPowerResponse = ApiSeries | ApiMeterPower[]

// Map API's 'name' back to 'id' for Nivo
export const toNivoSeries = (response: ApiPowerResponse): NivoSerie[] => {
  if (Array.isArray(response)) {
    return [{
      id: "KWH",
      data: response.map(({ name, KWH }) => ({ x: name, y: KWH })),
    }]
  }

  if (response && Array.isArray(response.series)) {
    return response.series.map(({ name, data }) => ({ id: name, data }))
  }

  throw new TypeError("Expected API response to contain a series array or meter rows")
}

// Maps a NivoSeries into a BarDatum object for bar graphs
export const seriesToBar = (series: NivoSerie[], indexBy = "x") => {
  const keys = series.map((s) => s.id)
  const rows = new Map<string, BarDatum>()
  for (const s of series) {
    for (const { x, y } of s.data) {
      const row = rows.get(x) ?? { [indexBy]: x }
      row[s.id] = y
      rows.set(x, row)
    }
  }
  return { data: [...rows.values()], keys, indexBy }
}

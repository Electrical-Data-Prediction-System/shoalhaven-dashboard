import { BarDatum } from "@nivo/bar";

export type NivoSerie = { id: string, data: { x: string, y: number }[] }
export type ApiPoint = { x: string, y: number }
export type ApiSeries = { series: { name: string; data: ApiPoint[] }[] }

// Map API's 'name' back to 'id' for Nivo
// TODO: Update shape on backend, change name to id in schema
export const toNivoSeries = (r: ApiSeries): NivoSerie[] => r.series.map(({ name, data }) => ({ id: name, data }))

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

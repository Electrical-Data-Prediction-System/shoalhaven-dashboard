import type { ApiPowerResponse, ApiSeries } from "./chart-data";

export type MeterSearchResult = {
  _id: string;
  location: {
    fullAddress: string;
    street: string;
    postcode: string;
    place: string;
    region: string;
    country: string;
  };
  type: string;
  unit: string;
};

export type ApiReading = {
  meterId: string;
  kwh: number;
  timestamp: string;
};

// In the browser, requests go through the same-origin proxy at /api/*, which
// forwards to API_INTERNAL_URL server-side. Server-side calls hit it directly.
const API_BASE = 
  typeof window === "undefined" 
    ? process.env.API_INTERNAL_URL 
    : process.env.NEXT_PUBLIC_API_URL;

export async function ApiFetch(path: string, init?: RequestInit) {
  if (!API_BASE) {
    throw new Error("API base URL is not configured (API_INTERNAL_URL missing)");
  }

  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export function GetMeter(meterId: string): Promise<{ meterObject: MeterSearchResult }> {
  return ApiFetch(`/meters/${meterId}`);
}

export function SearchMetersByLocation(location: string): Promise<MeterSearchResult[]> {
  const params = new URLSearchParams({ location });
  return ApiFetch(`/meters?${params}`);
}

export function GetAggregatedMeterPower(
  meterId: string,
  start?: Date,
  end?: Date,
  interval?: "5m" | "week" | "month" | "year",
): Promise<ApiPowerResponse> {
  const params = new URLSearchParams();
  if (start) params.set("start", start.toISOString());
  if (end) params.set("end", end.toISOString());
  if (interval) params.set("interval", interval);

  return ApiFetch(`/meters/${meterId}/aggregate-power?${params}`)
}

export function GetAllAggregatedMeterPower(start?: Date, end?: Date): Promise<ApiPowerResponse> {
  const params = new URLSearchParams();
  if (start) params.set("start", start.toISOString().split('T')[0]);
  if (end) params.set("end", end.toISOString().split('T')[0]);

  return ApiFetch(`/meters/power/aggregate-power?${params}`);
}

// Dates are formated in ISO: 2026-08-03 05:34:37.967019
export function GetReadingsBetween(meterId: string, start: Date, end?: Date): Promise<ApiReading[]> {
  const params = new URLSearchParams();
  params.set("start", start.toISOString());
  if (end) params.set("end", end.toISOString());

  return ApiFetch(`/meters/${meterId}/readings?${params}`)
}

export function GetLatestReadingTimestamp(meterId: string): Promise<string | null> {
  return ApiFetch(`/meters/${meterId}/readings/latest`).then((response) => response.timestamp)
}


export function SumReadingsBetween(start?: Date, end?: Date): Promise<ApiSeries> {
  const params = new URLSearchParams();
  if (start) params.set("start", start.toISOString());
  if (end) params.set("end", end.toISOString());

  return ApiFetch(`/readings/aggregate?${params}`)
}

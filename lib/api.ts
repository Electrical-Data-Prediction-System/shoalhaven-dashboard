const API_URL = process.env.API_URL;

export async function ApiFetch(path : string, init? : RequestInit) {
    const res = await fetch(`${API_URL}${path}`, init);
    if(!res.ok) throw new Error(`API error ${res.status}: ${path}`);
    return res.json();
} 


export function GetMeter(meterId : string){
    return ApiFetch(`/meters/${meterId}`);
}

export function GetAggregatedMeterPower(meterId : string, start? : Date, end? : Date){
    const params = new URLSearchParams();
    if(start) params.set("start", start.toISOString());
    if(end) params.set("end", end.toISOString());

    return ApiFetch(`meters/${meterId}/aggregate-power?${params}`)
}

export function GetAllAggregatedMeterPower(start? : Date, end? : Date){
    const params = new URLSearchParams();
    if(start) params.set("start", start.toISOString());
    if(end) params.set("end", end.toISOString());

    return ApiFetch(`/meters/power/aggregate-power?${params}`);
}

// Dates are formated in ISO: 2026-08-03 05:34:37.967019
export function GetReadingsBetween(meterId : string, start? : Date, end? : Date){
    const params = new URLSearchParams();
    if(start) params.set("start", start.toISOString());
    if(end) params.set("end", end.toISOString());

    return ApiFetch(`/meters/${meterId}/readings?${params}`)
}


export function SumReadingsBetween(start? : Date, end? : Date){
    const params = new URLSearchParams();
    if(start) params.set("start", start.toISOString());
    if(end) params.set("end", end.toISOString());

    return ApiFetch(`/readings/aggregate?${params}`)
}
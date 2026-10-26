"use client";

import { useEffect, useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useWidgetContext, type CreatedWidget, type WidgetFormConfig } from "@/features/dashboard/context/widget-context";
import { useModal } from "@/components/forms/modal";
import { GetMeter, SearchMetersByLocation, type MeterSearchResult } from "@/lib/api";
import { forecastGranularity, getWidgetMeterIds } from "@/features/dashboard/lib/widget-data";

function mergeMeters(...groups: MeterSearchResult[][]): MeterSearchResult[] {
  const metersById = new Map<string, MeterSearchResult>()
  for (const group of groups) {
    for (const meter of group) metersById.set(meter._id, meter)
  }
  return [...metersById.values()]
}

export default function WidgetForm({
  initialWidget,
  initialMeterId,
}: {
  initialWidget?: CreatedWidget
  /** Pre-selects a meter for a new chart, e.g. when a meter is clicked on the map */
  initialMeterId?: string
}) {
  const { closeModal } = useModal();
  const { onCreateWidget, updateCreatedWidget } = useWidgetContext();
  const [chartType, setChartType] = useState<WidgetFormConfig["type"] | undefined>(initialWidget?.type);
  const [showForecast, setShowForecast] = useState(initialWidget?.showForecast ?? false);
  const [dataMode, setDataMode] = useState<WidgetFormConfig["dataMode"]>(initialWidget?.dataMode ?? "aggregate");
  const [timePeriod, setTimePeriod] = useState<WidgetFormConfig["timePeriod"]>(
    initialWidget?.dataMode === "readings"
      ? initialWidget.timePeriod === "latest" ? "latest" : "day"
      : initialWidget?.timePeriod ?? "month",
  );
  const [selectedMeterIds, setSelectedMeterIds] = useState<string[]>(() =>
    initialWidget ? getWidgetMeterIds(initialWidget) : initialMeterId ? [initialMeterId] : [],
  )
  const [locationQuery, setLocationQuery] = useState("");
  const [searchMeters, setSearchMeters] = useState<MeterSearchResult[]>([]);
  const [selectedMeters, setSelectedMeters] = useState<MeterSearchResult[]>(() =>
    initialWidget?.meterDetails ?? [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [meterSelectionError, setMeterSelectionError] = useState<string | null>(null);
  const meters = mergeMeters(selectedMeters, searchMeters);
  const selectedTimePeriod = dataMode === "aggregate"
    ? (timePeriod === "latest" ? "month" : timePeriod)
    : (timePeriod === "5m" ? "day" : timePeriod)
  // Forecasts are per meter, so they're only offered for single-meter line and area charts
  const forecastAvailable = chartType !== undefined && forecastGranularity({
    type: chartType,
    dataMode,
    timePeriod: selectedTimePeriod,
    meterIds: selectedMeterIds,
  }) !== null

  // A meter clicked on the map: load its details so it shows by address, not just its id
  useEffect(() => {
    if (!initialMeterId || initialWidget) return

    let cancelled = false
    GetMeter(initialMeterId)
      .then(({ meterObject }) => {
        if (cancelled) return
        setSelectedMeters([meterObject])
        setLocationQuery(meterObject.location.fullAddress)
      })
      .catch(() => {
        // The id alone still works; the meter list just shows "Meter (id)"
      })

    return () => {
      cancelled = true
    }
  }, [initialMeterId, initialWidget])

  useEffect(() => {
    const location = locationQuery.trim();
    if (location.length < 2) return

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);
      SearchMetersByLocation(location)
        .then((results) => {
          if (!cancelled) {
            setSearchMeters(results)
          }
        })
        .catch((error: unknown) => {
          if (!cancelled) {
            setSearchError(error instanceof Error ? error.message : "Meter search failed");
          }
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [locationQuery]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const type = formData.get("type");
    const dataMode = formData.get("dataMode");
    const timePeriod = formData.get("timePeriod");

    if (!selectedMeterIds.length) {
      setMeterSelectionError("Select at least one meter.")
      return
    }
    setMeterSelectionError(null)

    if (!name || typeof type !== "string" || typeof dataMode !== "string" || typeof timePeriod !== "string") {
      return;
    }

    const config: WidgetFormConfig = {
      name,
      type: type as WidgetFormConfig["type"],
      dataMode: dataMode as WidgetFormConfig["dataMode"],
      timePeriod: timePeriod as WidgetFormConfig["timePeriod"],
      meterIds: selectedMeterIds,
      meterDetails: meters.filter((meter) => selectedMeterIds.includes(meter._id)),
      showForecast: forecastAvailable && showForecast,
    };

    if (initialWidget) {
      updateCreatedWidget(initialWidget.id, config)
    } else {
      onCreateWidget(config)
    }
    closeModal();
  };

  return (
    <div className="modal-content max-h-[calc(100dvh-4rem)] overflow-y-auto">
      <div className="mb-5 border-b border-border pb-4">
        <h2 className="text-xl font-semibold tracking-tight">
          {initialWidget ? "Edit chart" : "Create chart"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what to show and which meter to use.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 pl-2 pr-2">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">Chart name</label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Energy Consumption"
            defaultValue={initialWidget?.name}
            required
            className="h-10 bg-background"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="type" className="text-sm font-medium">Chart type</label>
            <Select
              name="type"
              defaultValue={initialWidget?.type}
              onValueChange={(value) => setChartType(value as WidgetFormConfig["type"])}
              required
            >
              <SelectTrigger id="type" className="h-10 w-full bg-background capitalize">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="pointer-events-auto">
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="area">Area</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
                <SelectItem value="datatable">Data table</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dataMode" className="text-sm font-medium">Data mode</label>
            <Select
              name="dataMode"
              defaultValue={initialWidget?.dataMode ?? "aggregate"}
              onValueChange={(value) => {
                const nextDataMode = value as WidgetFormConfig["dataMode"]
                setDataMode(nextDataMode)
                if (nextDataMode === "readings") setTimePeriod("day")
              }}
              required
            >
              <SelectTrigger id="dataMode" className="h-10 w-full bg-background capitalize">
                <SelectValue placeholder="Choose data mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aggregate">Aggregated totals</SelectItem>
                <SelectItem value="readings">Raw readings</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location-search" className="text-sm font-medium">Search location</label>
          <Input
            id="location-search"
            value={locationQuery}
            onChange={(event) => {
              const value = event.target.value
              setLocationQuery(value)
              if (value.trim().length < 2) {
                setSearchMeters([])
                setIsSearching(false)
                setSearchError(null)
              }
            }}
            placeholder="Address, suburb, postcode, or region"
            autoComplete="off"
            className="h-10 bg-background"
          />
          {isSearching && <p className="text-xs text-muted-foreground">Searching meters...</p>}
          {searchError && <p className="text-xs text-destructive">{searchError}</p>}
          {!isSearching && !searchError && locationQuery.trim().length >= 2 && searchMeters.length === 0 && (
            <p className="text-xs text-muted-foreground">No meters found.</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="meterIds" className="text-sm font-medium">Meters</label>
          <Select
            multiple
            value={selectedMeterIds}
            onValueChange={(value) => {
              setSelectedMeterIds(value)
              setSelectedMeters((current) => mergeMeters(
                current,
                meters.filter((meter) => value.includes(meter._id)),
              ).filter((meter) => value.includes(meter._id)))
              setMeterSelectionError(null)
            }}
          >
            <SelectTrigger id="meterIds" className="h-10 w-full bg-background">
              <SelectValue placeholder={meters.length ? "Select one or more meters" : "Search for a location first"} />
            </SelectTrigger>
            <SelectContent className="w-full">
              {selectedMeterIds
                .filter((meterId) => !meters.some((meter) => meter._id === meterId))
                .map((meterId) => (
                  <SelectItem key={meterId} value={meterId}>
                    Meter ({meterId})
                  </SelectItem>
                ))}
              {meters.map((meter) => (
                <SelectItem key={meter._id} value={meter._id}>
                  {meter.location.fullAddress} ({meter._id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMeterIds.map((meterId) => (
            <input key={meterId} type="hidden" name="meterIds" value={meterId} />
          ))}
          {selectedMeterIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedMeterIds.length} meter{selectedMeterIds.length === 1 ? "" : "s"} selected
            </p>
          )}
          {meterSelectionError && <p className="text-xs text-destructive">{meterSelectionError}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="timePeriod" className="text-sm font-medium">
            {dataMode === "aggregate" ? "Bucket interval" : "Readings range"}
          </label>
          <Select
            name="timePeriod"
            value={selectedTimePeriod}
            onValueChange={(value) => setTimePeriod(value as WidgetFormConfig["timePeriod"])}
            modal={false}
            required
          >
            <SelectTrigger id="timePeriod" className="h-10 w-full bg-background capitalize">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {dataMode === "aggregate" ? (
                <>
                  <SelectItem value="5m">Every 5 minutes</SelectItem>
                  <SelectItem value="day">Every day</SelectItem>
                  <SelectItem value="week">Every week</SelectItem>
                  <SelectItem value="month">Every month</SelectItem>
                  <SelectItem value="year">Every year</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="day">Last day</SelectItem>
                  <SelectItem value="latest">Most recent day</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="showForecast"
              checked={forecastAvailable && showForecast}
              disabled={!forecastAvailable}
              onChange={(event) => setShowForecast(event.target.checked)}
              className="size-4 cursor-pointer accent-primary disabled:cursor-not-allowed"
            />
            Show forecast
          </label>
          <p className="text-xs text-muted-foreground">
            {forecastAvailable
              ? dataMode === "readings"
                ? "Adds the next 7 days of hourly predicted usage."
                : "Adds the next 30 days of daily predicted usage."
              : "Available for line and area charts with one meter, showing raw readings or daily buckets."}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" className="cursor-pointer" variant="outline" onClick={() => closeModal()}>
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer">
            {initialWidget ? "Save changes" : "Create chart"}
          </Button>
        </div>
      </form>
    </div>
  );
}
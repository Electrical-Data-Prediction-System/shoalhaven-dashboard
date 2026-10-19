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
import { useWidgetContext, type CreatedWidget, type WidgetFormConfig } from "@/contexts/widget-context";
import { useModal } from "./modal";
import { GetMeter, SearchMetersByLocation, type MeterSearchResult } from "@/lib/api";

export default function WidgetForm({ initialWidget }: { initialWidget?: CreatedWidget }) {
  const { closeModal } = useModal();
  const { onCreateWidget, updateCreatedWidget } = useWidgetContext();
  const [dataMode, setDataMode] = useState<WidgetFormConfig["dataMode"]>(initialWidget?.dataMode ?? "aggregate");
  const [timePeriod, setTimePeriod] = useState<WidgetFormConfig["timePeriod"]>(initialWidget?.timePeriod ?? "month");
  const [locationQuery, setLocationQuery] = useState("");
  const [meters, setMeters] = useState<MeterSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const selectedTimePeriod = dataMode === "aggregate"
    ? (timePeriod === "day" ? "month" : timePeriod)
    : (timePeriod === "5m" ? "day" : timePeriod)

  useEffect(() => {
    if (!initialWidget) return

    let cancelled = false
    GetMeter(initialWidget.meterId)
      .then(({ meterObject }) => {
        if (cancelled) return
        setMeters([meterObject])
        setLocationQuery(meterObject.location.fullAddress)
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSearchError(error instanceof Error ? error.message : "Could not load the selected meter")
        }
      })

    return () => {
      cancelled = true
    }
  }, [initialWidget])

  useEffect(() => {
    const location = locationQuery.trim();
    if (location.length < 2) return

    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);
      SearchMetersByLocation(location)
        .then((results) => {
          if (!cancelled) setMeters(results);
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
    const meterId = formData.get("meterId");

    if (!name || typeof type !== "string" || typeof dataMode !== "string" || typeof timePeriod !== "string" || typeof meterId !== "string") {
      return;
    }

    const config: WidgetFormConfig = {
      name,
      type: type as WidgetFormConfig["type"],
      dataMode: dataMode as WidgetFormConfig["dataMode"],
      timePeriod: timePeriod as WidgetFormConfig["timePeriod"],
      meterId,
    };

    if (initialWidget) {
      updateCreatedWidget(initialWidget.id, config)
    } else {
      onCreateWidget(config)
    }
    closeModal();
  };

  return (
      <div className="modal-content" >
        <h2 className="text-lg font-semibold">{initialWidget ? "Edit widget" : "Create widget"}</h2>
        <form
          onSubmit={onSubmit}
          className="grid grid-cols-[150px_1fr] gap-4 items-center max-w-lg space-y-6"
        >
          {/* Name */}
          <label htmlFor="name">Name</label>

          <Input
            id="name"
            name="name"
            placeholder="e.g. Energy Consumption"
            defaultValue={initialWidget?.name}
            required
          />

          {/* Type */}
          <label>Type</label> 

              <Select name="type" defaultValue={initialWidget?.type} required>
                <SelectTrigger className="w-full" >
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent className="pointer-events-auto">
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                  <SelectItem value="datatable">Data Table</SelectItem>
                </SelectContent>
              </Select>

              <label>Data mode</label>
              <Select
                name="dataMode"
                defaultValue={initialWidget?.dataMode ?? "aggregate"}
                onValueChange={(value) => setDataMode(value as WidgetFormConfig["dataMode"])}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose data mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggregate">Aggregated totals</SelectItem>
                  <SelectItem value="readings">Raw readings</SelectItem>
                </SelectContent>
              </Select>

            <label htmlFor="location-search">Search location</label>
            <div className="space-y-1">
              <Input
                id="location-search"
                value={locationQuery}
                onChange={(event) => {
                  const value = event.target.value
                  setLocationQuery(value)
                  if (value.trim().length < 2) {
                    setMeters([])
                    setIsSearching(false)
                    setSearchError(null)
                  }
                }}
                placeholder="Address, suburb, postcode, or region"
                autoComplete="off"
              />
              {isSearching && <p className="text-sm text-muted-foreground">Searching meters...</p>}
              {searchError && <p className="text-sm text-destructive">{searchError}</p>}
              {!isSearching && !searchError && locationQuery.trim().length >= 2 && meters.length === 0 && (
                <p className="text-sm text-muted-foreground">No meters found.</p>
              )}
            </div>

            <label htmlFor="meterId">Meter</label>
            <Select name="meterId" defaultValue={initialWidget?.meterId} required>
              <SelectTrigger id="meterId" className="w-full">
                <SelectValue placeholder={meters.length ? "Select a meter" : "Search for a location first"} />
              </SelectTrigger>
              <SelectContent className="w-full">
                {meters.map((meter) => (
                  <SelectItem key={meter._id} value={meter._id}>
                    {meter.location.fullAddress} ({meter._id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Aggregation interval or raw-reading lookback */}
            <label>{dataMode === "aggregate" ? "Bucket interval" : "Readings range"}</label>

              <Select
                name="timePeriod"
                value={selectedTimePeriod}
                onValueChange={(value) => setTimePeriod(value as WidgetFormConfig["timePeriod"])}
                modal={false}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent >
                    {dataMode === "aggregate" ? (
                      <>
                        <SelectItem value="5m">Every 5 minutes</SelectItem>
                        <SelectItem value="week">Every week</SelectItem>
                        <SelectItem value="month">Every month</SelectItem>
                        <SelectItem value="year">Every year</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="day">Last day</SelectItem>
                        <SelectItem value="week">Last week</SelectItem>
                        <SelectItem value="month">Last month</SelectItem>
                        <SelectItem value="year">Last year</SelectItem>
                      </>
                    )}
                </SelectContent>
              </Select>

          {/* Buttons */}
          <div className="flex justify-end gap-2 col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => closeModal()}
            >
              Cancel
            </Button>

            <Button type="submit">
              {initialWidget ? "Save changes" : "Create Widget"}
            </Button>
          </div>
        </form>
      </div>
  );
}
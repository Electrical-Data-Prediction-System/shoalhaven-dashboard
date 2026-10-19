"use client";

import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useModal } from "./modal";

export default function WidgetForm() {
  const { closeModal } = useModal();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    console.log(values);
  };

  return (
      <div className="modal-content" >
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
          />

          {/* Type */}
          <label>Type</label> 

              <Select name="type">
                <SelectTrigger>
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent className="pointer-events-auto">
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="pie">Pie</SelectItem>
                  <SelectItem value="datatable">Data Table</SelectItem>
                </SelectContent>
              </Select>

            {/* Dataset */}
            <label>Dataset</label>

              <Select name="dataset">
                <SelectTrigger>
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent className="z[9999] relative">
                  <SelectItem value="energy">Energy</SelectItem>
                </SelectContent>
              </Select>

            {/* Time Period */}
            <label>Time Period</label>

              <Select name="timePeriod" modal={false}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent >
                  <SelectItem value="5m">Every 5 minutes</SelectItem>
                  <SelectItem value="week">Every week</SelectItem>
                  <SelectItem value="month">Every month</SelectItem>
                  <SelectItem value="year">Every year</SelectItem>
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
              Create Widget
            </Button>
          </div>
        </form>
      </div>
  );
}
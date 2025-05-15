"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium text-[var(--tw-text)]",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 text-[var(--tw-text)] hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell: "text-[var(--tw-text)] opacity-60 rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-[var(--tw-field)] [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal text-[var(--tw-text)] hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] focus:bg-[var(--tw-field)] focus:text-[var(--tw-text)] aria-selected:opacity-100"
        ),
        day_selected: "bg-[var(--tw-focus)] text-white hover:bg-[var(--tw-focus)] hover:text-white focus:bg-[var(--tw-focus)] focus:text-white",
        day_today: "bg-[var(--tw-field)] text-[var(--tw-text)]",
        day_outside: "text-[var(--tw-text)] opacity-50",
        day_disabled: "text-[var(--tw-text)] opacity-30",
        day_range_middle: "aria-selected:bg-[var(--tw-field)] aria-selected:text-[var(--tw-text)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props} />
  );
}

export { Calendar }

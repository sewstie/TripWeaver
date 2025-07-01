"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-[var(--tw-subbackground)] group/calendar p-2 [--cell-size:30px] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent shadow-md rounded-md max-w-[calc(100vw-2rem)] overflow-hidden origin-top",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-3 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-3", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 aria-disabled:opacity-50 select-none text-[var(--tw-text)] cursor-pointer",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-7 w-7 p-0 aria-disabled:opacity-50 select-none text-[var(--tw-text)] cursor-pointer",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-7 w-full px-2",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-7 gap-1",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-[var(--tw-focus)] border border-[var(--tw-border)] shadow-xs has-focus:ring-[var(--tw-focus)]/50 has-focus:ring-[2px] rounded-md cursor-pointer",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute inset-0 opacity-0 cursor-pointer",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium text-[var(--tw-text)]",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-7 [&>svg]:text-[var(--tw-text)]/70 [&>svg]:size-3 cursor-pointer",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-[var(--tw-text)]/70 rounded-md flex-1 font-normal text-[0.7rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-1", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-6",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.7rem] select-none text-[var(--tw-text)]/70",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        today: cn(
          "bg-[var(--tw-field)] text-[var(--tw-text)] font-medium rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        range_start: cn(
          "rounded-l-md bg-[var(--tw-focus)]/20",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "bg-[var(--tw-focus)]/10",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "rounded-r-md bg-[var(--tw-focus)]/20",
          defaultClassNames.range_end
        ),
        outside: cn(
          "text-[var(--tw-text)]/40 aria-selected:text-[var(--tw-text)]/40",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-[var(--tw-text)]/30 opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn("size-3 text-[var(--tw-focus)]", className)}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-3 text-[var(--tw-focus)]", className)}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn("size-3 text-[var(--tw-focus)]", className)}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex h-7 w-7 items-center justify-center text-center">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({ className, day, modifiers, ...props }) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "text-[var(--tw-text)] data-[selected-single=true]:bg-[var(--tw-focus)] data-[selected-single=true]:text-white hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] data-[range-middle=true]:bg-[var(--tw-focus)]/10 data-[range-middle=true]:text-[var(--tw-text)] data-[range-start=true]:bg-[var(--tw-focus)] data-[range-start=true]:text-white data-[range-end=true]:bg-[var(--tw-focus)] data-[range-end=true]:text-white group-data-[focused=true]/day:border-[var(--tw-focus)]/50 group-data-[focused=true]/day:ring-[var(--tw-focus)]/30 flex aspect-square size-auto w-full min-w-0 h-7 flex-col leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[2px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-[0.7rem] [&>span]:opacity-70 cursor-pointer text-sm p-0",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };

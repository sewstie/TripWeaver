"use client";
import { useState, useEffect } from "react";
import { Calendar, Map } from "lucide-react";
import DaySchedule from "../DaySchedule";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("../TripMap"), { ssr: false });

export default function CityPlanningView({
  city,
  tripId,
  userRole,
  canEdit,
  trip,
  mapPoints,
  selectedMapDay,
  onMapDayChange,
  handleSightAdded,
}) {
  const [viewMode, setViewMode] = useState("schedule");

  const generateCityDays = () => {
    if (!trip?.startDate) return [];

    const tripStart = trip.startDate.toDate
      ? trip.startDate.toDate()
      : new Date(trip.startDate);

    const regularCities =
      trip.cities?.filter(
        (c) =>
          !c.isArrivalCity &&
          !c.isDepartureCity &&
          !c.isRoundTripArrival &&
          !c.isRoundTripDeparture
      ) || [];

    const cityIndex = regularCities.findIndex((c) => c.id === city.id);
    let daysOffset = 0;

    for (let i = 0; i < cityIndex; i++) {
      daysOffset += regularCities[i].duration || 0;
    }

    const cityStartDate = new Date(tripStart);
    cityStartDate.setDate(cityStartDate.getDate() + daysOffset);

    const days = [];
    let currentDate = new Date(cityStartDate);

    for (let dayNumber = 1; dayNumber <= city.duration; dayNumber++) {
      const dateString = currentDate.toISOString().split("T")[0];
      days.push({
        dayNumber,
        date: new Date(currentDate),
        dateString,
        displayDate: currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const days = generateCityDays();

  const cityWithCallback = {
    ...city,
    onMapUpdate: handleSightAdded,
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex bg-[var(--tw-subbackground)] gap-1 rounded-lg p-1 w-fit">
          <button
            onClick={() => setViewMode("schedule")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === "schedule"
                ? "bg-[var(--tw-focus)] text-white"
                : "text-[var(--tw-text)] hover:bg-[var(--tw-subbackground)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === "map"
                ? "bg-[var(--tw-focus)] text-white"
                : "text-[var(--tw-text)] hover:bg-[var(--tw-subbackground)]"
            }`}
          >
            <Map className="w-4 h-4" />
            Map
          </button>
        </div>
      </div>

      {viewMode === "schedule" ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-4">
            Day-by-Day Schedule in {city.name}
          </h2>

          {days.length === 0 ? (
            <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 text-center">
              <p className="text-[var(--tw-text)] opacity-70">
                No days to display. Please check your city duration.
              </p>
            </div>
          ) : (
            days.map((day) => (
              <DaySchedule
                key={`${city.id}-day-${day.dayNumber}`}
                tripId={tripId}
                day={day.date}
                dayNumber={day.dayNumber}
                userRole={userRole}
                trip={{
                  ...cityWithCallback,
                  id: tripId,
                  cityId: city.id,
                }}
                cityContext={city}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <TripMap
            mapPoints={mapPoints}
            trip={{ ...trip, title: `${city.name} (${city.duration} days)` }}
            selectedDay={selectedMapDay}
            onDayChange={onMapDayChange}
            availableDays={days}
          />
        </div>
      )}
    </div>
  );
}

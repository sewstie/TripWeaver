"use client";
import { useState } from "react";
import { Calendar, Map } from "lucide-react";
import TripHeader from "../TripHeader";
import DaySchedule from "../DaySchedule";
import EditTripModal from "../EditTripModal";
import ManageAccessModal from "../ManageAccessModal";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("../TripMap"), { ssr: false });

export default function SingleTripLayout({
  trip,
  tripId,
  userRole,
  canEdit,
  mapPoints,
  selectedMapDay,
  onMapDayChange,
  onEdit,
  onManageAccess,
  onDelete,
  handleSightAdded,
  isEditModalOpen,
  onCloseEditModal,
  onTripUpdate,
  isManageAccessModalOpen,
  onCloseManageAccessModal,
}) {
  const [viewMode, setViewMode] = useState("schedule");

  const generateDays = () => {
    if (!trip?.startDate || !trip?.endDate) return [];

    const start = trip.startDate.toDate
      ? trip.startDate.toDate()
      : new Date(trip.startDate);
    const end = trip.endDate.toDate
      ? trip.endDate.toDate()
      : new Date(trip.endDate);
    const days = [];

    const currentDate = new Date(start);
    let dayNumber = 1;

    while (currentDate <= end) {
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
      dayNumber++;
    }

    return days;
  };

  const tripWithCallback = trip
    ? {
        ...trip,
        onMapUpdate: handleSightAdded,
      }
    : null;

  const days = generateDays();

  return (
    <div className="space-y-6">
      <TripHeader
        trip={trip}
        onEdit={onEdit}
        onManageAccess={onManageAccess}
        onDelete={onDelete}
      />

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
            Day-by-Day Schedule
          </h2>

          {days.length === 0 ? (
            <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 text-center">
              <p className="text-[var(--tw-text)] opacity-70">
                No days to display. Please check your trip dates.
              </p>
            </div>
          ) : (
            days.map((day) => (
              <DaySchedule
                key={day.dayNumber}
                tripId={tripId}
                day={day.date}
                dayNumber={day.dayNumber}
                userRole={userRole}
                trip={tripWithCallback}
              />
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <TripMap
            mapPoints={mapPoints}
            trip={trip}
            selectedDay={selectedMapDay}
            onDayChange={onMapDayChange}
            availableDays={days}
          />
        </div>
      )}

      {isEditModalOpen && canEdit && (
        <EditTripModal
          trip={trip}
          onClose={onCloseEditModal}
          onUpdate={onTripUpdate}
        />
      )}

      {isManageAccessModalOpen && (
        <ManageAccessModal trip={trip} onClose={onCloseManageAccessModal} />
      )}
    </div>
  );
}

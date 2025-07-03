"use client";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  MapPin,
  Edit,
  Trash2,
  Clock,
  StickyNote,
  GripVertical,
} from "lucide-react";
import Confirmation from "@/app/components/Confirmation";

export default function CitySetupCard({
  city,
  tripId,
  canEdit,
  totalTrip,
  availableDays,
  onEditCity,
  onCityClick,
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, "trips", tripId, "cities", city.id));
    } catch (error) {
      console.error("Error deleting city:", error);
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 opacity-50">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[var(--tw-focus)] mr-3"></div>
          <span className="text-[var(--tw-text)]">Removing city...</span>
        </div>
      </div>
    );
  }

  const isSpecialCity =
    city.isArrivalCity ||
    city.isDepartureCity ||
    city.isRoundTripArrival ||
    city.isRoundTripDeparture;
  const isRoundTripCity = city.isRoundTripArrival || city.isRoundTripDeparture;
  const canEditThisCity =
    isRoundTripCity || (!city.isArrivalCity && !city.isDepartureCity);

  return (
    <>
      <div
        className={`bg-[var(--tw-subbackground)] rounded-lg p-4 border-l-4 ${
          city.isArrivalCity || city.isRoundTripArrival
            ? "border-green-500"
            : city.isDepartureCity || city.isRoundTripDeparture
            ? "border-red-500"
            : "border-[var(--tw-focus)]"
        } ${
          !isSpecialCity
            ? "cursor-pointer hover:bg-opacity-90 transition-colors"
            : ""
        }`}
        onClick={() => {
          if (!isSpecialCity && onCityClick) {
            onCityClick(city);
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {canEdit &&
              !city.isArrivalCity &&
              !city.isDepartureCity &&
              !city.isRoundTripArrival &&
              !city.isRoundTripDeparture && (
                <div className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--tw-field)] rounded transition-colors mt-1">
                  <GripVertical className="w-4 h-4 text-[var(--tw-text)] opacity-40" />
                </div>
              )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin
                  className={`w-5 h-5 ${
                    city.isArrivalCity || city.isRoundTripArrival
                      ? "text-green-500"
                      : city.isDepartureCity || city.isRoundTripDeparture
                      ? "text-red-500"
                      : "text-[var(--tw-focus)]"
                  }`}
                />
                <h3 className="text-lg font-semibold text-[var(--tw-text)]">
                  {city.name}
                </h3>
                {city.isArrivalCity && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
                    Arrival
                  </span>
                )}
                {city.isDepartureCity && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                    Departure
                  </span>
                )}
                {city.isRoundTripArrival && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded-full">
                    Arrival Day
                  </span>
                )}
                {city.isRoundTripDeparture && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                    Departure Day
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-[var(--tw-text)] opacity-60" />
                <span className="text-[var(--tw-text)] opacity-80">
                  {city.isArrivalCity || city.isDepartureCity
                    ? "Transit city"
                    : isRoundTripCity
                    ? `${city.duration || 1} ${
                        (city.duration || 1) === 1 ? "day" : "days"
                      } ${
                        city.isRoundTripArrival ? "(arrival)" : "(departure)"
                      }`
                    : `${city.duration || 1} ${
                        (city.duration || 1) === 1 ? "day" : "days"
                      }`}
                </span>
              </div>

              {city.notes && (
                <div className="flex items-start gap-2 mb-3">
                  <StickyNote className="w-4 h-4 text-[var(--tw-text)] opacity-60 mt-0.5 flex-shrink-0" />
                  <p className="text-[var(--tw-text)] opacity-80 text-sm">
                    {city.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {canEdit && canEditThisCity && (
            <div className="flex gap-1">
              <button
                onClick={() => onEditCity(city)}
                className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded transition-colors"
                title="Edit city"
              >
                <Edit className="w-4 h-4 text-[var(--tw-text)] opacity-60" />
              </button>
              {!isRoundTripCity && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded transition-colors"
                  title="Remove city"
                >
                  <Trash2 className="w-4 h-4 text-red-500 opacity-60" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {!isRoundTripCity && !city.isArrivalCity && !city.isDepartureCity && (
        <Confirmation
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Remove City"
          message={`Are you sure you want to remove "${city.name}" from your trip? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </>
  );
}

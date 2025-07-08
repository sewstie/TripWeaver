"use client";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Trash2, Calendar, Clock, StickyNote } from "lucide-react";
import Confirmation from "@/app/components/Confirmation";

export default function CitySetupCard({
  city,
  tripId,
  canEdit,
  totalTrip,
  availableDays,
  onEditCity,
  onCityClick,
  isMobile = false,
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
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:justify-between ${
            isMobile ? "gap-3" : ""
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--tw-text)]">
                {city.name}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2">
              <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--tw-text)] opacity-70">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>
                  {city.duration} day{city.duration !== 1 ? "s" : ""}
                </span>
              </div>
              {city.notes && (
                <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--tw-text)] opacity-70">
                  <StickyNote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="truncate max-w-[200px] sm:max-w-[300px]">
                    {city.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? "mt-3" : ""}`}>
            <button
              onClick={() => onCityClick(city)}
              className="cursor-pointer border border-[var(--tw-focus)] text-white px-4 sm:px-6 py-1.5 rounded-lg transition-colors text-xs sm:text-sm flex items-center gap-1 flex-1 sm:flex-auto justify-center"
              title="Plan day by day"
            >
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Plan
            </button>

            {canEditThisCity && canEdit && (
              <button
                onClick={() => onEditCity(city)}
                className="cursor-pointer text-[var(--tw-text)] opacity-70 hover:opacity-100 p-2 rounded-lg hover:bg-[var(--tw-field)]"
                title="Edit city"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {canEdit && (
              <button
                onClick={isSpecialCity ? () => {} : () => setShowConfirm(true)}
                className={`cursor-${
                  isSpecialCity ? "not-allowed" : "pointer"
                } p-2 rounded-lg ${
                  !isSpecialCity ? "hover:bg-[var(--tw-field)]" : ""
                }
                  ${
                    isSpecialCity
                      ? "text-red-400 dark:text-gray-600"
                      : "text-red-400 hover:text-red-300"
                  }`}
                title={
                  isSpecialCity
                    ? `${
                        city.isArrivalCity || city.isRoundTripArrival
                          ? "Arrival"
                          : "Departure"
                      } cities cannot be removed`
                    : "Delete city"
                }
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <Confirmation
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          title="Delete City"
          message={`Are you sure you want to delete ${city.name} from your trip? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </>
  );
}

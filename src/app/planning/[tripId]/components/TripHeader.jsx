"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { MoreVertical } from "lucide-react";

export default function TripHeader({ trip, onEdit, onManageAccess, onDelete }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return "";
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const calculateDuration = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;

    const start = trip.startDate.toDate
      ? trip.startDate.toDate()
      : new Date(trip.startDate);
    const end = trip.endDate.toDate
      ? trip.endDate.toDate()
      : new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getDestination = () => {
    if (trip?.arrivalCity) {
      return (
        trip.arrivalCity.components?.country ||
        (trip.arrivalCity.formatted
          ? trip.arrivalCity.formatted.split(",").pop().trim()
          : "Unknown Country")
      );
    }
    return trip?.destination?.includes(",")
      ? trip.destination.split(",").pop().trim()
      : trip.destination || "Unknown Destination";
  };

  const isOwner = trip?.collaborators?.[currentUser?.uid] === "owner";
  const canEdit =
    isOwner || trip?.collaborators?.[currentUser?.uid] === "editor";

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
        <div className="flex-1 mb-3 sm:mb-0">
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--tw-text)] mb-1 sm:mb-2 pr-10 sm:pr-0">
            {trip?.title || trip?.name}
          </h1>
          <p className="text-base sm:text-lg text-[var(--tw-text)] opacity-70 mb-2 sm:mb-3">
            {getDestination()}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-sm text-[var(--tw-text)] opacity-60">
            <span>Start: {formatDate(trip?.startDate)}</span>
            <span>End: {formatDate(trip?.endDate)}</span>
            <span>{calculateDuration()} days</span>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors absolute top-[-60px] sm:static right-0"
            aria-label="Trip menu"
            aria-expanded={isMenuOpen}
          >
            <MoreVertical className="w-5 h-5 text-[var(--tw-text)]" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg shadow-lg z-10">
              {canEdit && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEdit();
                  }}
                  className="cursor-pointer w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
                >
                  Edit Trip Details
                </button>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onManageAccess();
                }}
                className="cursor-pointer w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
              >
                Manage Access
              </button>
              {isOwner && (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDelete();
                  }}
                  className="cursor-pointer w-full text-left px-4 py-3 text-red-500 hover:bg-[var(--tw-field)] transition-colors"
                >
                  Delete Trip
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {trip?.description && (
        <p className="text-[var(--tw-text)] opacity-80 text-sm">
          {trip.description}
        </p>
      )}
    </div>
  );
}

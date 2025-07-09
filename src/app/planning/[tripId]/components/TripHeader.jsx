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
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 relative">
      {/* Menu Button - Absolutely positioned and centered vertically */}
      <div
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-10"
        ref={menuRef}
      >
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
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
      <div className="pr-10">
        <div className="mb-3 sm:mb-4">
          <h1 className="text-xl sm:text-3xl font-bold text-[var(--tw-text)] mb-1 sm:mb-2">
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

        {trip?.description && (
          <p className="text-[var(--tw-text)] opacity-80 text-sm">
            {trip.description}
          </p>
        )}
      </div>
    </div>
  );
}

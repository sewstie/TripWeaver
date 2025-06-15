"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TripHeader({ trip, onEdit, onShare, onDelete }) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-[var(--tw-text)] mb-2">
            {trip?.name}
          </h1>
          <p className="text-lg text-[var(--tw-text)] opacity-70 mb-3">
            {trip?.destination}
          </p>
          <div className="flex gap-6 text-sm text-[var(--tw-text)] opacity-60">
            <span>Start: {formatDate(trip?.startDate)}</span>
            <span>End: {formatDate(trip?.endDate)}</span>
            <span>{calculateDuration()} days</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-[var(--tw-text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  onEdit && onEdit();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
              >
                Edit Trip Details
              </button>
              <button
                onClick={() => {
                  onShare && onShare();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
              >
                Share by Email
              </button>
              <button
                onClick={() => {
                  onDelete && onDelete();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-[var(--tw-field)] transition-colors"
              >
                Delete Trip
              </button>
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

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

export default function TripHeader({ trip, onEdit, onInvite, onDelete }) {
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
    
    const start = trip.startDate.toDate ? trip.startDate.toDate() : new Date(trip.startDate);
    const end = trip.endDate.toDate ? trip.endDate.toDate() : new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
            className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-[var(--tw-text)]" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg shadow-lg z-10">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit();
                }}
                className="cursor-pointer w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
              >
                Edit Trip Details
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onInvite();
                }}
                className="cursor-pointer w-full text-left px-4 py-3 text-[var(--tw-text)] hover:bg-[var(--tw-field)] transition-colors"
              >
                Invite Collaborator
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete();
                }}
                className="cursor-pointer w-full text-left px-4 py-3 text-red-500 hover:bg-[var(--tw-field)] transition-colors"
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

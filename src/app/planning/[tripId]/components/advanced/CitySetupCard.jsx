"use client";
import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
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
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDuration, setEditDuration] = useState(city.duration || 1);
  const [editNotes, setEditNotes] = useState(city.notes || "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const minDuration =
      city.isRoundTripArrival || city.isRoundTripDeparture ? 1 : 1;
    if (editDuration < minDuration) return;

    setIsSaving(true);
    try {
      await updateDoc(doc(db, "trips", tripId, "cities", city.id), {
        duration: parseInt(editDuration),
        notes: editNotes.trim(),
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating city:", error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleCancel = () => {
    setEditDuration(city.duration || 1);
    setEditNotes(city.notes || "");
    setIsEditing(false);
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
  const maxDuration = isRoundTripCity
    ? availableDays + (city.duration || 0)
    : isSpecialCity
    ? 0
    : availableDays + (city.duration || 0);

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
                {isEditing && isRoundTripCity ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      min="1"
                      max={maxDuration}
                      className="w-20 px-2 py-1 rounded border border-[var(--tw-border)] bg-[var(--tw-field)] text-[var(--tw-text)] text-sm"
                    />
                    <span className="text-sm text-[var(--tw-text)] opacity-70">
                      {editDuration == 1 ? "day" : "days"}
                    </span>
                    <span className="text-xs text-[var(--tw-text)] opacity-60">
                      {city.isRoundTripArrival
                        ? "(arrival activities)"
                        : "(departure activities)"}
                    </span>
                  </div>
                ) : isEditing && !isSpecialCity ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      min="1"
                      max={maxDuration}
                      className="w-20 px-2 py-1 rounded border border-[var(--tw-border)] bg-[var(--tw-field)] text-[var(--tw-text)] text-sm"
                    />
                    <span className="text-sm text-[var(--tw-text)] opacity-70">
                      {editDuration == 1 ? "day" : "days"}
                    </span>
                  </div>
                ) : (
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
                )}
              </div>

              {isEditing && canEditThisCity ? (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder={
                      city.isRoundTripArrival
                        ? "Activities for your arrival day..."
                        : city.isRoundTripDeparture
                        ? "Activities before departure..."
                        : "Add notes about this city..."
                    }
                    rows={2}
                    className="w-full px-3 py-2 rounded border border-[var(--tw-border)] bg-[var(--tw-field)] text-[var(--tw-text)] text-sm resize-none"
                  />
                </div>
              ) : (
                city.notes && (
                  <div className="flex items-start gap-2 mb-3">
                    <StickyNote className="w-4 h-4 text-[var(--tw-text)] opacity-60 mt-0.5 flex-shrink-0" />
                    <p className="text-[var(--tw-text)] opacity-80 text-sm">
                      {city.notes}
                    </p>
                  </div>
                )
              )}

              {isEditing && canEditThisCity && (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={
                      isSaving || editDuration < 1 || editDuration > maxDuration
                    }
                    className="cursor-pointer bg-[var(--tw-focus)] text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="cursor-pointer bg-[var(--tw-field)] text-[var(--tw-text)] px-3 py-1 rounded text-sm hover:bg-opacity-80 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {canEdit && canEditThisCity && !isEditing && (
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
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

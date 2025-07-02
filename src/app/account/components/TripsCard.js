"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db, deleteDoc, doc, getDoc } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Confirmation from "@/app/components/Confirmation";
import { format } from "date-fns";

export default function TripsCard({ trips, setTrips }) {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    isOpen: false,
    tripId: null,
    tripName: "",
  });
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });
  const router = useRouter();

  const getDateObject = (dateInput) => {
    if (!dateInput) return new Date(0);

    try {
      if (dateInput.toDate) {
        return dateInput.toDate();
      }

      if (typeof dateInput === "string") {
        return new Date(dateInput);
      }

      return new Date(dateInput);
    } catch (error) {
      console.error("Date conversion error:", error);
      return new Date(0);
    }
  };

  const sortedTrips = useMemo(() => {
    if (!trips || !trips.length) return [];

    return [...trips].sort((a, b) => {
      const dateA = getDateObject(a.startDate);
      const dateB = getDateObject(b.startDate);
      return dateA - dateB;
    });
  }, [trips]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";

    try {
      if (dateString.toDate) {
        dateString = dateString.toDate();
      }

      if (typeof dateString === "string") {
        dateString = new Date(dateString);
      }
      return format(dateString, "d MMMM");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Not set";
    }
  };

  const handleDeleteClick = (e, tripId, tripName) => {
    e.stopPropagation();
    setConfirmDelete({
      isOpen: true,
      tripId,
      tripName,
    });
  };

  const confirmDeleteTrip = async () => {
    const { tripId } = confirmDelete;
    setConfirmDelete({ isOpen: false, tripId: null, tripName: "" });

    try {
      const tripRef = doc(db, "trips", tripId);
      const tripDoc = await getDoc(tripRef);

      if (tripDoc.exists()) {
        const tripData = tripDoc.data();
        if (tripData.collaborators[currentUser.uid] === "owner") {
          await deleteDoc(tripRef);
          setTrips(trips.filter((trip) => trip.id !== tripId));
        } else {
          setErrorModal({
            isOpen: true,
            message: "Only the trip owner can delete this trip.",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      setErrorModal({
        isOpen: true,
        message: "Failed to delete trip. Please try again.",
      });
    }
  };

  const handleTripClick = (trip) => {
    router.push(`/planning/${trip.id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 dashboard-card">
        <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-6">
          Your Trips
        </h2>

        {sortedTrips.length === 0 ? (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <p className="text-[var(--tw-text)] opacity-70 mb-4">
              You haven't created any trips yet.
            </p>
            <button
              onClick={() => router.push("/")}
              className="cursor-pointer bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Plan Your First Trip
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="space-y-4">
              {sortedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => handleTripClick(trip)}
                  className="bg-[var(--tw-field)] flex justify-between rounded-lg p-4 hover:bg-opacity-80 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col justify-between min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-[var(--tw-text)] truncate">
                      {trip.name}
                    </h3>
                    <span className="text-[var(--tw-text)] opacity-70 text-sm truncate">
                      {trip.type === "advanced"
                        ? trip.arrivalCity?.formatted?.split(",")[0] ||
                          "Advanced Trip"
                        : trip.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="flex flex-col items-end text-xs text-[var(--tw-text)] opacity-70">
                      <span>
                        {formatDate(trip.startDate)} -{" "}
                        {formatDate(trip.endDate)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, trip.id, trip.name)}
                      className="text-red-400 hover:text-red-300 cursor-pointer p-1 transition-colors flex-shrink-0"
                      title="Delete trip"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Confirmation
        isOpen={confirmDelete.isOpen}
        onClose={() =>
          setConfirmDelete({ isOpen: false, tripId: null, tripName: "" })
        }
        onConfirm={confirmDeleteTrip}
        title="Delete Trip"
        message={`Are you sure you want to delete "${confirmDelete.tripName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <Confirmation
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        title="Permission Denied"
        message={errorModal.message}
        confirmText="OK"
        type="warning"
        singleButton={true}
      />
    </>
  );
}

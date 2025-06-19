"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db, deleteDoc, doc, getDoc } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import Confirmation from "@/app/components/Confirmation";

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

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    if (dateString.toDate) {
      return dateString.toDate().toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
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
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 h-full flex flex-col">
        <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-6">
          Your Trips
        </h2>

        {trips.length === 0 ? (
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
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
            <div className="grid gap-4 pr-1">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => handleTripClick(trip)}
                  className="gap-2 bg-[var(--tw-field)] flex justify-between rounded-lg p-4 hover:bg-opacity-80 transition-colors cursor-pointer"
                >
                  <div className="flex flex-col justify-between">
                    <h3 className="text-lg font-semibold text-[var(--tw-text)]">
                      {trip.name}
                    </h3>
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex justify-end gap-6">
                    <div className="flex items-center gap-4 text-xs">
                      <span>{formatDate(trip.startDate)}</span>
                      <span>-</span>
                      <span>{formatDate(trip.endDate)}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, trip.id, trip.name)}
                      className="text-red-400 cursor-pointer p-1 transition-colors"
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

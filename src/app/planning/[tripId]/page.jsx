"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import TripHeader from "./components/TripHeader";
import DaySchedule from "./components/DaySchedule";
import EditTripModal from "./components/EditTripModal";
import ManageAccessModal from "./components/ManageAccessModal";

export default function TripPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageAccessModalOpen, setIsManageAccessModalOpen] = useState(false);

  const tripId = params.tripId;

  useEffect(() => {
    const fetchTrip = async () => {
      if (!currentUser || !tripId) {
        setLoading(false);
        return;
      }

      try {
        const tripDoc = await getDoc(doc(db, "trips", tripId));

        if (!tripDoc.exists()) {
          setError("Trip not found");
          return;
        }

        const tripData = { id: tripDoc.id, ...tripDoc.data() };

        if (!tripData.collaborators?.[currentUser.uid]) {
          setError("You don't have access to this trip");
          return;
        }

        setTrip(tripData);
      } catch (error) {
        setError("Failed to load trip: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [currentUser, tripId]);

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
      days.push({
        dayNumber,
        date: new Date(currentDate),
        dateString: currentDate.toLocaleDateString("en-US", {
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

  const handleEditTrip = () => {
    setIsEditModalOpen(true);
  };

  const handleTripUpdate = (updatedTrip) => {
    setTrip(updatedTrip);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleManageAccess = () => {
    setIsManageAccessModalOpen(true);
  };

  const handleCloseManageAccessModal = () => {
    setIsManageAccessModalOpen(false);
  };

  const handleDeleteTrip = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${trip?.name}"?\n\nThis action cannot be undone and will delete all itinerary items for this trip.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const itineraryQuery = query(
        collection(db, "trips", tripId, "itineraryItems")
      );
      const itinerarySnapshot = await getDocs(itineraryQuery);

      const batch = writeBatch(db);

      itinerarySnapshot.docs.forEach((docSnapshot) => {
        batch.delete(docSnapshot.ref);
      });

      if (!itinerarySnapshot.empty) {
        await batch.commit();
      }

      await deleteDoc(doc(db, "trips", tripId));

      router.push("/account");
    } catch (error) {
      alert("Failed to delete trip. Please try again.");
      setIsDeleting(false);
    }
  };

  const userRole = trip?.collaborators?.[currentUser?.uid];
  const canEdit = userRole === "owner" || userRole === "editor";

  if (isDeleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[var(--tw-text)] mb-2">
            Deleting Trip...
          </h2>
          <p className="text-[var(--tw-text)] opacity-70">
            Please wait while we remove all trip data.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto mb-4"></div>
          <p className="text-[var(--tw-text)]">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--tw-text)] mb-4">
            Error
          </h1>
          <p className="text-[var(--tw-text)] opacity-70 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--tw-text)] mb-4">
            Trip Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const days = generateDays();

  return (
    <div className="min-h-screen bg-[var(--tw-background)] pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <TripHeader
          trip={trip}
          onEdit={handleEditTrip}
          onManageAccess={handleManageAccess}
          onDelete={handleDeleteTrip}
        />

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
                canEdit={canEdit}
              />
            ))
          )}
        </div>

        {isEditModalOpen && canEdit && (
          <EditTripModal
            trip={trip}
            onClose={handleCloseEditModal}
            onUpdate={handleTripUpdate}
          />
        )}

        {isManageAccessModalOpen && (
          <ManageAccessModal
            trip={trip}
            onClose={handleCloseManageAccessModal}
          />
        )}
      </div>
    </div>
  );
}

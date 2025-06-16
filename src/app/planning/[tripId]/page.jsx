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
  setIndexConfiguration,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import TripHeader from "./components/TripHeader";
import DaySchedule from "./components/DaySchedule";
import EditTripModal from "./components/EditTripModal";

export default function TripPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const tripId = params.tripId;

  useEffect(() => {
    const fetchTrip = async () => {
      if (!currentUser || !tripId) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching trip:", tripId);
        const tripDoc = await getDoc(doc(db, "trips", tripId));

        if (!tripDoc.exists()) {
          console.log("Trip not found");
          setError("Trip not found");
          return;
        }

        const tripData = { id: tripDoc.id, ...tripDoc.data() };
        console.log("Trip data:", tripData);

        if (!tripData.collaborators?.includes(currentUser.uid)) {
          setError("You don't have access to this trip");
          return;
        }

        setTrip(tripData);
      } catch (error) {
        console.error("Error fetching trip:", error);
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

  const handleShareTrip = () => {
    console.log("Share trip clicked");
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
      console.log("Deleting itinerary items...");
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
        console.log(`Deleted ${itinerarySnapshot.size} itinerary items`);
      }

      console.log("Deleting trip document...");
      await deleteDoc(doc(db, "trips", tripId));

      console.log("Trip deleted successfully");

      router.push("/account");
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip. Please try again.");
      setIsDeleting(false);
    }
  };

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
            className="bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
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
          onShare={handleShareTrip}
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
              />
            ))
          )}
        </div>

        {isEditModalOpen && (
          <EditTripModal
            trip={trip}
            onClose={handleCloseEditModal}
            onUpdate={handleTripUpdate}
          />
        )}
      </div>
    </div>
  );
}

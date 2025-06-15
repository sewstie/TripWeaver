"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, doc, getDoc } from "@/lib/firebase";
import TripHeader from "./components/TripHeader";
import DaySchedule from "./components/DaySchedule";

export default function TripPage() {
  const params = useParams();
  const { currentUser } = useAuth();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    console.log("Edit trip clicked");
  };

  const handleShareTrip = () => {
    console.log("Share trip clicked");
  };

  const handleDeleteTrip = () => {
    console.log("Delete trip clicked");
  };

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
      </div>
    </div>
  );
}

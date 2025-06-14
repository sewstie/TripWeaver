"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, doc, getDoc } from "@/lib/firebase";

export default function TripPlanningPage() {
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

  const formatDate = (date) => {
    if (!date) return "";
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
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

  return (
    <div className="min-h-screen bg-[var(--tw-background)] pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--tw-text)] mb-2">
            {trip?.name}
          </h1>
          <p className="text-[var(--tw-text)] opacity-70 mb-4">
            {trip?.destination}
          </p>
          <div className="flex gap-4 text-sm text-[var(--tw-text)] opacity-60">
            <span>Start: {formatDate(trip?.startDate)}</span>
            <span>End: {formatDate(trip?.endDate)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-4">
                Trip Itinerary
              </h2>
              <p className="text-[var(--tw-text)] opacity-70">
                Welcome to your trip planning page! Start adding activities and
                destinations.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
              <h3 className="text-xl font-bold text-[var(--tw-text)] mb-4">
                Trip Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-[var(--tw-text)] opacity-60">
                    Destination:
                  </span>
                  <p className="text-[var(--tw-text)]">{trip?.destination}</p>
                </div>
                <div>
                  <span className="text-[var(--tw-text)] opacity-60">
                    Duration:
                  </span>
                  <p className="text-[var(--tw-text)]">
                    {trip?.startDate &&
                      trip?.endDate &&
                      Math.ceil(
                        (new Date(trip.endDate) - new Date(trip.startDate)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                    days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

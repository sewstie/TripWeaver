"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  db,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function TripsCard() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) return;

      try {
        const q = query(
          collection(db, "trips"),
          where("collaborators", "array-contains", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const userTrips = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTrips(userTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    if (dateString.toDate) {
      return dateString.toDate().toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  const handleDeleteTrip = async (tripId) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteDoc(doc(db, "trips", tripId));
        setTrips(trips.filter((trip) => trip.id !== tripId));
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
    }
  };

  const handleViewTrip = (trip) => {
    router.push(`/planning/${trip.id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
      <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-6">
        Your Trips
      </h2>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[var(--tw-text)] opacity-70 mb-4">
            You haven't created any trips yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Plan Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-[var(--tw-field)] rounded-lg p-4 hover:bg-opacity-80 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-[var(--tw-text)]">
                  {trip.name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="text-[var(--tw-focus)] hover:underline text-sm"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id)}
                    className="text-red-400 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-[var(--tw-text)] opacity-70 text-sm mb-2">
                {trip.destination}
              </p>
              <div className="flex gap-4 text-xs text-[var(--tw-text)] opacity-60">
                <span>Start: {formatDate(trip.startDate)}</span>
                <span>End: {formatDate(trip.endDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
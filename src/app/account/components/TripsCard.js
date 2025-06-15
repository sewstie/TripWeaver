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
import { Trash2 } from "lucide-react";

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
        if (error.code === "failed-precondition") {
          console.log("Index is still building. Please wait...");
        } else {
          console.error("Error fetching trips:", error);
        }
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

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteDoc(doc(db, "trips", tripId));
        setTrips(trips.filter((trip) => trip.id !== tripId));
      } catch (error) {
        console.error("Error deleting trip:", error);
      }
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
                className="bg-[var(--tw-field)] flex justify-between rounded-lg p-4 hover:bg-opacity-80 transition-colors cursor-pointer"
              >
                <div className="flex flex-col justify-between">
                  <h3 className="text-lg font-semibold text-[var(--tw-text)]">
                    {trip.name}
                  </h3>
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span>{formatDate(trip.startDate)}</span>
                  <span>-</span>
                  <span>{formatDate(trip.endDate)}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteTrip(e, trip.id)}
                  className="text-red-400 cursor-pointer p-1 transition-colors"
                  title="Delete trip"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  Trash2,
  Plus,
} from "lucide-react";

export default function TripsCard() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTrips = () => {
      try {
        const savedTrips = localStorage.getItem(`trips_${currentUser?.uid}`);
        if (savedTrips) {
          setTrips(JSON.parse(savedTrips));
        }
      } catch (error) {
        console.error("Error loading trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.uid) {
      loadTrips();
    }
  }, [currentUser]);

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDeleteTrip = (tripId) => {
    const updatedTrips = trips.filter((trip) => trip.id !== tripId);
    setTrips(updatedTrips);
    localStorage.setItem(
      `trips_${currentUser?.uid}`,
      JSON.stringify(updatedTrips)
    );
  };

  const handleViewTrip = (trip) => {
    console.log("Viewing trip:", trip);
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 border-[var(--tw-border)]">
        <div className="animate-pulse">
          <div className="h-6 bg-[var(--tw-border)] rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[var(--tw-border)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 border-[var(--tw-border)]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[var(--tw-text)] flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          My Trips
        </h2>
        <div className="text-sm text-[var(--tw-text)] opacity-70">
          {trips.length} trip{trips.length !== 1 ? "s" : ""}
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-[var(--tw-text)] opacity-30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--tw-text)] mb-2">
            No trips yet
          </h3>
          <p className="text-[var(--tw-text)] opacity-70 mb-4">
            Start planning your first adventure!
          </p>
          <button className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[var(--tw-focus)] text-white rounded-lg hover:opacity-90 transition-opacity mx-auto">
            <Plus className="h-4 w-4" />
            Create New Trip
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip, index) => (
            <div
              key={trip.id || index}
              className="border border-[var(--tw-border)] rounded-lg p-4 hover:border-[var(--tw-focus)] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--tw-text)]">
                  {trip.destination || `Trip ${index + 1}`}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewTrip(trip)}
                    className="cursor-pointer p-1.5 text-[var(--tw-text)] opacity-70 hover:opacity-100 hover:bg-[var(--tw-border)] rounded transition-all"
                    title="View trip"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip.id || index)}
                    className="cursor-pointer p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500 hover:bg-opacity-10 rounded transition-all"
                    title="Delete trip"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--tw-text)] opacity-70">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[var(--tw-text)] opacity-70">
                  <Clock className="h-4 w-4" />
                  <span>{trip.duration || "Duration not set"}</span>
                </div>

                <div className="flex items-center gap-2 text-[var(--tw-text)] opacity-70">
                  <Users className="h-4 w-4" />
                  <span>
                    {trip.travelers || trip.groupSize || "1"} traveler
                    {trip.travelers > 1 || trip.groupSize > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {trip.activities && trip.activities.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--tw-border)]">
                  <div className="flex flex-wrap gap-2">
                    {trip.activities.slice(0, 3).map((activity, actIndex) => (
                      <span
                        key={actIndex}
                        className="px-2 py-1 bg-[var(--tw-focus)] bg-opacity-10 text-[var(--tw-focus)] text-xs rounded-full"
                      >
                        {activity}
                      </span>
                    ))}
                    {trip.activities.length > 3 && (
                      <span className="px-2 py-1 bg-[var(--tw-border)] text-[var(--tw-text)] opacity-70 text-xs rounded-full">
                        +{trip.activities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

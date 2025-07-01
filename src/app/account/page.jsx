"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import ProfileCard from "./components/ProfileCard";
import TripsCard from "./components/TripsCard";
import WorldMap from "./components/WorldMap";
import { db, collection, query, where, getDocs, orderBy } from "@/lib/firebase";

export default function AccountPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(true);

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser) return;

      try {
        setIsLoadingTrips(true);

        const tripsQuery = query(
          collection(db, "trips"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(tripsQuery);
        const allTrips = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userTrips = allTrips.filter(
          (trip) => trip.collaborators && trip.collaborators[currentUser.uid]
        );

        setTrips(userTrips);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setIsLoadingTrips(false);
      }
    };

    fetchTrips();
  }, [currentUser]);

  const handleTripClick = (trip) => {
    router.push(`/planning/${trip.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)]"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--tw-background)] pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-[var(--tw-text)] mb-8">
          Account Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2 h-full">
            <ProfileCard />
          </div>
          <div className="lg:col-span-2 h-full">
            <TripsCard trips={trips} setTrips={setTrips} />
          </div>
        </div>

        <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--tw-text)]">
              Your Travel Map
            </h2>
            <div className="text-sm text-[var(--tw-text)] opacity-70">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} planned
            </div>
          </div>

          {isLoadingTrips ? (
            <div className="h-96 bg-[var(--tw-field)] rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)]"></div>
            </div>
          ) : trips.length === 0 ? (
            <div className="h-96 bg-[var(--tw-field)] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-[var(--tw-text)] opacity-70 mb-4">
                  No trips to display on the map yet.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Plan Your First Trip
                </button>
              </div>
            </div>
          ) : (
            <WorldMap trips={trips} onTripClick={handleTripClick} />
          )}
        </div>
      </div>
    </div>
  );
}

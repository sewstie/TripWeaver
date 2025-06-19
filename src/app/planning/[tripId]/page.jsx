"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  deleteDoc,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import dynamic from "next/dynamic";
import { Calendar, Map } from "lucide-react";
import TripHeader from "./components/TripHeader";
import DaySchedule from "./components/DaySchedule";
import EditTripModal from "./components/EditTripModal";
import ManageAccessModal from "./components/ManageAccessModal";
import Confirmation from "@/app/components/Confirmation";

const TripMap = dynamic(() => import("./components/TripMap"), { ssr: false });

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewMode, setViewMode] = useState("schedule");
  const [mapPoints, setMapPoints] = useState([]);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const handleSightAdded = (newSight) => {
    if (newSight.coordinates) {
      setMapPoints((prev) => {
        const existingIndex = prev.findIndex(
          (point) => point.id === newSight.id
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            id: newSight.id,
            name: newSight.name,
            location: newSight.location,
            coordinates: newSight.coordinates,
            day: newSight.day,
            notes: newSight.notes,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: newSight.id,
              name: newSight.name,
              location: newSight.location,
              coordinates: newSight.coordinates,
              day: newSight.day,
              notes: newSight.notes,
            },
          ];
        }
      });
    }
  };

  const tripWithCallback = trip
    ? {
        ...trip,
        onMapUpdate: handleSightAdded,
      }
    : null;

  const tripId = params.tripId;

  useEffect(() => {
    const fetchTrip = async () => {
      if (!currentUser) {
        setError("Please log in to view this trip");
        setLoading(false);
        return;
      }

      try {
        const tripDoc = await getDoc(doc(db, "trips", tripId));

        if (!tripDoc.exists()) {
          setError("Trip not found");
          setLoading(false);
          return;
        }

        const tripData = { id: tripDoc.id, ...tripDoc.data() };

        if (
          !tripData.collaborators ||
          !tripData.collaborators[currentUser.uid]
        ) {
          setError("You don't have access to this trip");
          setLoading(false);
          return;
        }

        setTrip(tripData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trip:", error);
        setError("Failed to load trip");
        setLoading(false);
      }
    };

    fetchTrip();
  }, [currentUser, tripId]);

  useEffect(() => {
    if (!tripId) return;

    const q = query(collection(db, "trips", tripId, "itineraryItems"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.coordinates) {
            items.push({
              id: doc.id,
              name: data.name,
              location: data.location,
              coordinates: data.coordinates,
              day: data.day,
              notes: data.notes,
            });
          }
        });
        setMapPoints(items);
      },
      (error) => {
        console.error("Error fetching itinerary items:", error);
      }
    );

    return () => unsubscribe();
  }, [tripId]);

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

  const handleDeleteTrip = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteTrip = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, "trips", tripId));
      router.push("/trips");
    } catch (error) {
      console.error("Error deleting trip:", error);
      setErrorModal({
        isOpen: true,
        message: "Failed to delete trip. Please try again.",
      });
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-[var(--tw-text)] opacity-70">{error}</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--tw-text)] mb-2">
            Trip Not Found
          </h2>
          <p className="text-[var(--tw-text)] opacity-70">
            The trip you're looking for doesn't exist or you don't have access
            to it.
          </p>
        </div>
      </div>
    );
  }

  const days = generateDays();

  return (
    <>
      <div className="min-h-screen bg-[var(--tw-background)] pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <TripHeader
            trip={trip}
            onEdit={handleEditTrip}
            onManageAccess={handleManageAccess}
            onDelete={handleDeleteTrip}
          />

          <div className="mb-6">
            <div className="flex bg-[var(--tw-field)] rounded-lg p-1 w-fit">
              <button
                onClick={() => setViewMode("schedule")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "schedule"
                    ? "bg-[var(--tw-focus)] text-white"
                    : "text-[var(--tw-text)] hover:bg-[var(--tw-subbackground)]"
                }`}
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === "map"
                    ? "bg-[var(--tw-focus)] text-white"
                    : "text-[var(--tw-text)] hover:bg-[var(--tw-subbackground)]"
                }`}
              >
                <Map className="w-4 h-4" />
                Map
              </button>
            </div>
          </div>

          {viewMode === "schedule" ? (
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
                    userRole={userRole}
                    trip={tripWithCallback}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-4">
                Trip Map
              </h2>
              <TripMap mapPoints={mapPoints} trip={trip} />
              {mapPoints.length === 0 && (
                <div className="bg-[var(--tw-subbackground)] rounded-lg p-6 text-center">
                  <p className="text-[var(--tw-text)] opacity-70">
                    No locations with coordinates found. Add sights to your trip
                    to see them on the map.
                  </p>
                </div>
              )}
            </div>
          )}

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

      <Confirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteTrip}
        title="Delete Trip"
        message={`Are you sure you want to permanently delete "${trip?.name}"? This action cannot be undone and will delete all itinerary items for this trip.`}
        confirmText="Delete Trip"
        cancelText="Cancel"
        type="danger"
      />

      <Confirmation
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: "" })}
        title="Error"
        message={errorModal.message}
        confirmText="OK"
        type="danger"
        singleButton={true}
      />
    </>
  );
}

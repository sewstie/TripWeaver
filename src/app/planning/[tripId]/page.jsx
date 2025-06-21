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
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import Confirmation from "@/app/components/Confirmation";
import SingleTripLayout from "./components/single/SingleTripLayout";
import AdvancedTripLayout from "./components/advanced/AdvancedTripLayout";

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
  const [mapPoints, setMapPoints] = useState([]);
  const [selectedMapDay, setSelectedMapDay] = useState(0);
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
  });

  const tripId = params.tripId;

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
    if (!tripId || trip?.type === "advanced") return;

    const q = query(
      collection(db, "trips", tripId, "itineraryItems"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const items = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (
            data.coordinates &&
            data.coordinates.lat &&
            data.coordinates.lng
          ) {
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
  }, [tripId, trip?.type]);

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
      router.push("/account");
    } catch (error) {
      console.error("Error deleting trip:", error);
      setErrorModal({
        isOpen: true,
        message: "Failed to delete trip. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  const handleMapDayChange = (dayIndex) => {
    setSelectedMapDay(dayIndex);
  };

  const userRole = trip?.collaborators?.[currentUser?.uid];
  const canEdit = userRole === "owner" || userRole === "editor";
  const isAdvanced = trip?.type === "advanced";

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

  const commonProps = {
    trip,
    tripId,
    userRole,
    canEdit,
    onEdit: handleEditTrip,
    onManageAccess: handleManageAccess,
    onDelete: handleDeleteTrip,
    isEditModalOpen,
    onCloseEditModal: handleCloseEditModal,
    onTripUpdate: handleTripUpdate,
    isManageAccessModalOpen,
    onCloseManageAccessModal: handleCloseManageAccessModal,
  };

  return (
    <>
      <div className="min-h-screen bg-[var(--tw-background)]">
        <div className="container mx-auto px-4 max-w-4xl pt-20 pb-8">
          {isAdvanced ? (
            <AdvancedTripLayout {...commonProps} />
          ) : (
            <SingleTripLayout
              {...commonProps}
              mapPoints={mapPoints}
              selectedMapDay={selectedMapDay}
              onMapDayChange={handleMapDayChange}
              handleSightAdded={handleSightAdded}
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

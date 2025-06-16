"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import SightCard from "./SightCard";
import AddSightModal from "./AddSightModal";

export default function DaySchedule({ tripId, day, dayNumber }) {
  const [sights, setSights] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSight, setEditingSight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dayString = day.toISOString().split("T")[0];

    const q = query(
      collection(db, "trips", tripId, "itineraryItems"),
      where("day", "==", dayString),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const dayItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSights(dayItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching sights:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tripId, day]);

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleEditSight = (sight) => {
    setEditingSight(sight);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSight(null);
  };

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--tw-text)]">
            Day {dayNumber}
          </h3>
          <p className="text-[var(--tw-text)] opacity-70">{formatDate(day)}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer bg-[var(--tw-focus)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Add Sight
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--tw-focus)]"></div>
          </div>
        ) : sights.length === 0 ? (
          <div className="border-l-2 border-[var(--tw-field)] pl-4">
            <p className="text-[var(--tw-text)] opacity-60 italic">
              No activities planned for this day yet.
            </p>
          </div>
        ) : (
          sights.map((sight, index) => (
            <SightCard
              key={sight.id}
              sight={sight}
              tripId={tripId}
              isLast={index === sights.length - 1}
              onEdit={handleEditSight}
            />
          ))
        )}
      </div>

      {isModalOpen && (
        <AddSightModal
          tripId={tripId}
          day={day.toISOString().split("T")[0]}
          editingSight={editingSight}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

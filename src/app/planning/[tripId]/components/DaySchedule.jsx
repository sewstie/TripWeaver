"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import SightCard from "./SightCard";
import AddSightModal from "./AddSightModal";

export default function DaySchedule({ tripId, day, dayNumber, userRole }) {
  const [sights, setSights] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSight, setEditingSight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const updateOrderInFirestore = async (newSightsOrder) => {
    setIsReordering(true);
    try {
      const batch = writeBatch(db);

      newSightsOrder.forEach((sight, index) => {
        const sightRef = doc(db, "trips", tripId, "itineraryItems", sight.id);
        batch.update(sightRef, {
          order: index,
          updatedAt: new Date(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating order:", error);
      setSights(sights);
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sights.findIndex((sight) => sight.id === active.id);
      const newIndex = sights.findIndex((sight) => sight.id === over.id);

      const newSightsOrder = arrayMove(sights, oldIndex, newIndex);
      setSights(newSightsOrder);

      updateOrderInFirestore(newSightsOrder);
    }
  };

  const canEdit = userRole && userRole !== "viewer";

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--tw-text)]">
            Day {dayNumber}
          </h3>
          <p className="text-[var(--tw-text)] opacity-70">{formatDate(day)}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="cursor-pointer bg-[var(--tw-focus)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Add Sight
          </button>
        )}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={sights.map((sight) => sight.id)}
              strategy={verticalListSortingStrategy}
            >
              {sights.map((sight, index) => (
                <SightCard
                  key={sight.id}
                  sight={sight}
                  tripId={tripId}
                  isLast={index === sights.length - 1}
                  onEdit={handleEditSight}
                  canEdit={canEdit}
                  isReordering={isReordering}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {canEdit && isModalOpen && (
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

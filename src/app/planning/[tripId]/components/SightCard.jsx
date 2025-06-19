"use client";
import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Confirmation from "@/app/components/Confirmation";

export default function SightCard({
  sight,
  tripId,
  isLast,
  onEdit,
  canEdit = false,
  isReordering = false,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sight.id,
    disabled: !canEdit || isDeleting,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDeleteClick = () => {
    if (!canEdit) return;
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowConfirm(false);
    setIsDeleting(true);

    try {
      await deleteDoc(doc(db, "trips", tripId, "itineraryItems", sight.id));
    } catch (error) {
      console.error("Error deleting sight:", error);
      setIsDeleting(false);
    }
  };

  if (isDeleting) {
    return (
      <div className="flex items-center space-x-4 opacity-50">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--tw-focus)]"></div>
        <span className="text-[var(--tw-text)] opacity-70">Deleting...</span>
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-start space-x-4 ${isDragging ? "z-50" : ""} ${
          isReordering ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-[var(--tw-focus)] rounded-full"></div>
          {!isLast && (
            <div className="w-0.5 h-16 bg-[var(--tw-field)] mt-2"></div>
          )}
        </div>

        <div className="flex-1 bg-[var(--tw-field)] rounded-lg p-4">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2 flex-1">
                {canEdit && (
                  <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-[var(--tw-subbackground)] rounded transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4 text-[var(--tw-text)] opacity-40" />
                  </div>
                )}
                <h4 className="font-semibold text-[var(--tw-text)] flex-1">
                  {sight.name}
                </h4>
              </div>
              {canEdit && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(sight)}
                    className="cursor-pointer p-1 hover:bg-[var(--tw-subbackground)] rounded transition-colors"
                    disabled={isReordering}
                  >
                    <Edit className="w-4 h-4 text-[var(--tw-text)] opacity-60" />
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="cursor-pointer p-1 hover:bg-[var(--tw-subbackground)] rounded transition-colors"
                    disabled={isReordering}
                  >
                    <Trash2 className="w-4 h-4 text-red-500 opacity-60" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[var(--tw-text)] opacity-70 text-sm mb-1">
              {sight.location}
            </p>
            {sight.notes && (
              <p className="text-[var(--tw-text)] opacity-60 text-sm">
                {sight.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      <Confirmation
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sight"
        message={`Are you sure you want to delete "${sight.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}

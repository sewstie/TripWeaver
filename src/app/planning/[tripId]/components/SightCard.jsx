"use client";
import { useState } from "react";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Edit, Trash2 } from "lucide-react";

export default function SightCard({ sight, tripId, isLast }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: sight.name || "",
    location: sight.location || "",
    notes: sight.notes || "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    try {
      await updateDoc(doc(db, "trips", tripId, "itineraryItems", sight.id), {
        name: editData.name,
        location: editData.location,
        notes: editData.notes,
        updatedAt: new Date(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating sight:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this sight?")) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "trips", tripId, "itineraryItems", sight.id));
    } catch (error) {
      console.error("Error deleting sight:", error);
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: sight.name || "",
      location: sight.location || "",
      notes: sight.notes || "",
    });
    setIsEditing(false);
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
    <div className="flex items-start space-x-4">
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-[var(--tw-focus)] rounded-full"></div>
        {!isLast && (
          <div className="w-0.5 h-16 bg-[var(--tw-field)] mt-2"></div>
        )}
      </div>

      <div className="flex-1 bg-[var(--tw-field)] rounded-lg p-4">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)]"
              placeholder="Sight name"
            />
            <input
              type="text"
              value={editData.location}
              onChange={(e) =>
                setEditData({ ...editData, location: e.target.value })
              }
              className="w-full bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)]"
              placeholder="Location"
            />
            <textarea
              value={editData.notes}
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
              className="w-full bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] resize-none"
              placeholder="Notes (optional)"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="bg-[var(--tw-focus)] text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-[var(--tw-field)] text-[var(--tw-text)] px-3 py-1 rounded text-sm hover:bg-opacity-80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-[var(--tw-text)]">
                {sight.name}
              </h4>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-[var(--tw-subbackground)] rounded transition-colors"
                >
                  <Edit className="w-4 h-4 text-[var(--tw-text)] opacity-60" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1 hover:bg-[var(--tw-subbackground)] rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-500 opacity-60" />
                </button>
              </div>
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
        )}
      </div>
    </div>
  );
}

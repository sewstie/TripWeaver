"use client";
import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";

export default function AddSightModal({ tripId, day, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.location.trim()) {
      setError("Name and location are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const existingItemsQuery = query(
        collection(db, "trips", tripId, "itineraryItems"),
        where("day", "==", day)
      );
      const existingItems = await getDocs(existingItemsQuery);
      const nextOrder = existingItems.size;

      await addDoc(collection(db, "trips", tripId, "itineraryItems"), {
        name: formData.name.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        day: day,
        order: nextOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      onClose();
    } catch (error) {
      console.error("Error adding sight:", error);
      setError("Failed to add sight. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--tw-text)]">
            Add New Sight
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Sight Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
              placeholder="e.g., Eiffel Tower"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
              placeholder="e.g., Champ de Mars, Paris"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] resize-none"
              placeholder="Any additional notes..."
              rows={3}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[var(--tw-focus)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Sight"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[var(--tw-field)] text-[var(--tw-text)] py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

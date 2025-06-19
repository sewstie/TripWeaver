"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { geocodeLocation } from "@/lib/geocoding";

export default function AddSightModal({ tripId, day, editingSight, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingSight) {
      setFormData({
        name: editingSight.name || "",
        location: editingSight.location || "",
        notes: editingSight.notes || "",
      });
    }
  }, [editingSight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim()) {
      setError("Name and location are required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const sightData = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        notes: formData.notes.trim(),
        day,
        createdAt: new Date(),
        order: editingSight ? editingSight.order : Date.now(),
      };

      if (editingSight) {
        await updateDoc(
          doc(db, "trips", tripId, "itineraryItems", editingSight.id),
          sightData
        );

        if (!editingSight.coordinates && formData.location.trim()) {
          const coordinates = await geocodeLocation(formData.location.trim());
          if (coordinates) {
            await updateDoc(
              doc(db, "trips", tripId, "itineraryItems", editingSight.id),
              {
                coordinates: {
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                },
              }
            );
          }
        }
      } else {
        const docRef = await addDoc(
          collection(db, "trips", tripId, "itineraryItems"),
          sightData
        );

        if (formData.location.trim()) {
          const coordinates = await geocodeLocation(formData.location.trim());
          if (coordinates) {
            await updateDoc(
              doc(db, "trips", tripId, "itineraryItems", docRef.id),
              {
                coordinates: {
                  lat: coordinates.lat,
                  lng: coordinates.lng,
                },
              }
            );
          }
        }
      }

      onClose();
    } catch (error) {
      console.error("Error saving sight:", error);
      setError("Failed to save sight. Please try again.");
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--tw-background)] rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-[var(--tw-border)]">
          <h2 className="text-xl font-bold text-[var(--tw-text)]">
            {editingSight ? "Edit Sight" : "Add New Sight"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--tw-subbackground)] transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--tw-border)] rounded-lg bg-[var(--tw-field)] text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] focus:border-transparent"
              placeholder="e.g., Eiffel Tower"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              Location *
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-[var(--tw-border)] rounded-lg bg-[var(--tw-field)] text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] focus:border-transparent"
              placeholder="e.g., Champ de Mars, Paris, France"
              disabled={isSubmitting}
            />
            <p className="text-xs text-[var(--tw-text)] opacity-70 mt-1">
              Be specific for accurate map placement
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--tw-border)] rounded-lg bg-[var(--tw-field)] text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] focus:border-transparent resize-none"
              placeholder="Additional notes or details..."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-[var(--tw-border)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-subbackground)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[var(--tw-focus)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingSight ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

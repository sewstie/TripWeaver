"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X } from "lucide-react";

export default function EditTripModal({ trip, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (trip) {
      const formatDateForInput = (date) => {
        if (!date) return "";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toISOString().split("T")[0];
      };

      setFormData({
        name: trip.name || "",
        destination: trip.destination || "",
        description: trip.description || "",
        startDate: formatDateForInput(trip.startDate),
        endDate: formatDateForInput(trip.endDate),
      });
    }
  }, [trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Trip name is required");
      return;
    }

    if (!formData.destination.trim()) {
      setError("Destination is required");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("Start and end dates are required");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("End date must be after start date");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateDoc(doc(db, "trips", trip.id), {
        name: formData.name.trim(),
        destination: formData.destination.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: new Date(),
      });

      if (onUpdate) {
        onUpdate({
          ...trip,
          name: formData.name.trim(),
          destination: formData.destination.trim(),
          description: formData.description.trim(),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          updatedAt: new Date(),
        });
      }

      onClose();
    } catch (error) {
      console.error("Error updating trip:", error);
      setError("Failed to update trip. Please try again.");
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
      <div className="fixed inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl opacity-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--tw-text)]">
            Edit Trip Details
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
              Trip Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
              placeholder="e.g., Summer in Europe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Destination *
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
              placeholder="e.g., Paris, France"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] resize-none"
              placeholder="Add a description for your trip..."
              rows={3}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex-1 bg-[var(--tw-focus)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 bg-[var(--tw-field)] text-[var(--tw-text)] py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
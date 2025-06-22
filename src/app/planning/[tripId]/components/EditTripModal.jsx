"use client";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Calendar, CheckCircle } from "lucide-react";

export default function EditTripModal({ trip, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: trip?.description || "",
    startDate: "",
    endDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflowY = "scroll";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    if (trip) {
      const formatDate = (date) => {
        if (!date) return "";
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj.toISOString().split("T")[0];
      };

      const getDefaultTitle = () => {
        if (trip.arrivalCity) {
          const cityName =
            trip.arrivalCity.components?.city ||
            trip.arrivalCity.components?.town ||
            trip.arrivalCity.components?.village ||
            trip.arrivalCity.formatted?.split(",")[0] ||
            "Unknown City";
          return `Trip to ${cityName}`;
        }

        if (trip.title && trip.title.trim()) {
          return trip.title;
        }

        return "My Trip";
      };

      setFormData({
        title: getDefaultTitle(),
        description: trip.description || "",
        startDate: formatDate(trip.startDate),
        endDate: formatDate(trip.endDate),
      });
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        updatedAt: new Date(),
      };

      await updateDoc(doc(db, "trips", trip.id), updateData);

      setMessage("Trip updated successfully!");
      setMessageType("success");

      if (onUpdate) {
        onUpdate({ ...trip, ...updateData });
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error updating trip:", error);
      setMessage("Failed to update trip. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidDateRange = () => {
    if (!formData.startDate || !formData.endDate) return false;
    return new Date(formData.startDate) <= new Date(formData.endDate);
  };

  const canSubmit = () => {
    return (
      formData.title.trim() &&
      formData.startDate &&
      formData.endDate &&
      isValidDateRange()
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        height: "100vh",
        top: `${window.scrollY}px`,
      }}
    >
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex justify-between items-center px-6 pt-6">
          <h3 className="text-xl font-bold text-[var(--tw-text)]">
            Edit Trip Details
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 p-6"
          style={{ scrollbarColor: "var(--tw-border) transparent" }}
        >
          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                  : "bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
              }`}
            >
              {messageType === "success" && (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-[var(--tw-text)]">
                Trip Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter trip title..."
                className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-[var(--tw-text)]">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors resize-none"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-[var(--tw-text)] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-[var(--tw-text)] flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] transition-colors"
                  required
                />
              </div>
            </div>

            {!isValidDateRange() && formData.startDate && formData.endDate && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">
                  End date must be after or equal to start date
                </p>
              </div>
            )}
          </form>
        </div>

        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2 border border-[var(--tw-border)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-field)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit()}
              className="cursor-pointer flex-1 bg-[var(--tw-focus)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                "Update Trip"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

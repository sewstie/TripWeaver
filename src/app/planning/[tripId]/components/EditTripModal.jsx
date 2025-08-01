"use client";
import { useState, useEffect, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { createScrollLock } from "@/lib/utils/modalUtils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function EditTripModal({ trip, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    description: trip?.description || "",
    startDate: undefined,
    endDate: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const startDateBtnRef = useRef(null);
  const endDateBtnRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        startDateBtnRef.current?.contains(e.target) ||
        endDateBtnRef.current?.contains(e.target) ||
        startCalendarRef.current?.contains(e.target) ||
        endCalendarRef.current?.contains(e.target)
      ) {
        return;
      }

      setStartDateOpen(false);
      setEndDateOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const metaViewport = document.querySelector("meta[name=viewport]");
    if (!metaViewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      document.head.appendChild(meta);
    } else {
      metaViewport.content =
        "width=device-width, initial-scale=1, maximum-scale=1";
    }

    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    const removeScrollLock = createScrollLock();

    return () => {
      removeScrollLock();
      window.removeEventListener("resize", checkMobile);

      if (metaViewport) {
        metaViewport.content = "width=device-width, initial-scale=1";
      }
    };
  }, []);

  useEffect(() => {
    if (trip) {
      const formatDate = (date) => {
        if (!date) return undefined;
        const dateObj = date.toDate ? date.toDate() : new Date(date);
        return dateObj;
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

  useEffect(() => {
    if (
      formData.startDate &&
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      setFormData((prev) => ({ ...prev, endDate: formData.startDate }));
    }
  }, [formData.startDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: date,
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
        startDate: formData.startDate,
        endDate: formData.endDate,
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
      setMessage("Failed to update. Try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidDateRange = () => {
    if (!formData.startDate || !formData.endDate) return false;
    return formData.startDate <= formData.endDate;
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{
        height: "100vh",
        marginTop: `${scrollY}px`,
      }}
    >
      <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="bg-[var(--tw-subbackground)] rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[var(--tw-border)]">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--tw-text)]">
            Edit Trip Details
          </h3>
          <button
            onClick={onClose}
            className="relative cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 p-4 sm:p-6"
          style={{ scrollbarColor: "var(--tw-border) transparent" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)]">
                Trip Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter trip title..."
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)]">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your trip..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors resize-none"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="relative">
                <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Start Date
                </label>
                <div className="relative">
                  <Button
                    ref={startDateBtnRef}
                    type="button"
                    variant="outline"
                    className="cursor-pointer w-full px-4 py-2.5 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] border-[var(--tw-border)] text-[var(--tw-text)]"
                    onClick={() => {
                      setStartDateOpen(!startDateOpen);
                      setEndDateOpen(false);
                    }}
                  >
                    {formData.startDate ? (
                      format(formData.startDate, "PPP")
                    ) : (
                      <span>Select start date</span>
                    )}
                  </Button>

                  {startDateOpen && (
                    <div
                      ref={startCalendarRef}
                      className="absolute bottom-full mb-2 z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-1 max-w-full sm:max-w-[280px] overflow-y-auto max-h-[350px]"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => {
                          handleDateChange("startDate", date);
                          setStartDateOpen(false);
                        }}
                        disabled={(date) => date < new Date()}
                        className="text-[var(--tw-text)] w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)] flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  End Date
                </label>
                <div className="relative">
                  <Button
                    ref={endDateBtnRef}
                    type="button"
                    variant="outline"
                    className="cursor-pointer w-full px-4 py-2.5 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] border-[var(--tw-border)] text-[var(--tw-text)]"
                    onClick={() => {
                      setEndDateOpen(!endDateOpen);
                      setStartDateOpen(false);
                    }}
                  >
                    {formData.endDate ? (
                      format(formData.endDate, "PPP")
                    ) : (
                      <span>Select end date</span>
                    )}
                  </Button>

                  {endDateOpen && (
                    <div
                      ref={endCalendarRef}
                      className="absolute bottom-full mb-2 z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-1 max-w-full sm:max-w-[280px] overflow-y-auto max-h-[350px]"
                    >
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => {
                          handleDateChange("endDate", date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date() ||
                          (formData.startDate
                            ? date < formData.startDate
                            : false)
                        }
                        className="text-[var(--tw-text)] w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isValidDateRange() && formData.startDate && formData.endDate && (
              <p className="text-red-500 font-medium text-sm text-center">
                End date must be after or equal to start date
              </p>
            )}
          </form>
        </div>

        <div className="border-t border-[var(--tw-border)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2.5 border border-[var(--tw-border)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-field)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit()}
              className="cursor-pointer flex-1 bg-[var(--tw-focus)] text-white px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Updating...</span>
                </>
              ) : (
                "Update Trip"
              )}
            </button>
          </div>

          <div className="mt-1 min-h-[20px] text-center text-sm transition-opacity duration-300">
            {message && messageType === "success" ? (
              <p className="text-green-500 font-medium">{message}</p>
            ) : message && messageType === "error" ? (
              <p className="text-red-500 font-medium">{message}</p>
            ) : (
              <p className="opacity-0">Status message placeholder</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

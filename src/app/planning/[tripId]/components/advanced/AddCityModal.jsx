"use client";
import { useState, useRef, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, MapPin, Loader2 } from "lucide-react";
import { createScrollLock } from "@/lib/utils/modalUtils";

export default function AddCityModal({
  tripId,
  onClose,
  availableDays,
  existingCities,
  trip,
  editingCity = null,
}) {
  const [formData, setFormData] = useState({
    name: editingCity?.name || "",
    duration:
      editingCity?.duration ||
      Math.min(3, Math.max(1, availableDays + (editingCity?.duration || 0))),
    notes: editingCity?.notes || "",
  });
  const [selectedLocation, setSelectedLocation] = useState(
    editingCity?.locationDetails || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const isEditing = !!editingCity;
  const canEditName = isEditing
    ? !editingCity.isArrivalCity &&
      !editingCity.isDepartureCity &&
      !editingCity.isRoundTripArrival &&
      !editingCity.isRoundTripDeparture
    : true;
  const maxDuration = availableDays + (editingCity?.duration || 0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    const removeScrollLock = createScrollLock();

    // Add meta viewport for better mobile input experience
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

    return () => {
      removeScrollLock();
      window.removeEventListener("resize", checkMobile);

      if (metaViewport) {
        metaViewport.content = "width=device-width, initial-scale=1";
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocationSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocations(true);

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${
          process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
        }&limit=8&no_annotations=1&language=en&roadinfo=0&address_only=1`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const cityResults = data.results.filter(
          (result) =>
            (result.components.city ||
              result.components.town ||
              result.components.village) &&
            result.components.country &&
            !result.components.road &&
            !result.components.house_number &&
            !result.components.postcode_only
        );

        setLocationSuggestions(cityResults);
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
      }
    } catch (error) {
      console.error("Error searching locations:", error);
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocations(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, name: value }));
    setSelectedLocation(null);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchLocationSuggestions(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (suggestion) => {
    const cityName =
      suggestion.components.city ||
      suggestion.components.town ||
      suggestion.components.village ||
      suggestion.formatted.split(",")[0];

    setFormData((prev) => ({ ...prev, name: cityName }));
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("City name is required");
      return;
    }

    if (formData.duration < 1 || formData.duration > maxDuration) {
      setError(`Duration must be between 1 and ${maxDuration} days`);
      return;
    }

    const regularCities = existingCities.filter(
      (c) =>
        !c.isArrivalCity &&
        !c.isDepartureCity &&
        (!isEditing || c.id !== editingCity.id)
    );
    const cityExists = regularCities.some(
      (city) => city.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (cityExists) {
      setError("This city is already in your itinerary");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const cityData = {
        name: formData.name.trim(),
        duration: parseInt(formData.duration),
        notes: formData.notes.trim(),
        updatedAt: new Date(),
      };

      if (isEditing) {
        await updateDoc(
          doc(db, "trips", tripId, "cities", editingCity.id),
          cityData
        );
      } else {
        cityData.order = existingCities.filter(
          (c) => !c.isArrivalCity && !c.isDepartureCity
        ).length;
        cityData.createdAt = serverTimestamp();
        cityData.locationDetails = selectedLocation
          ? {
              ...selectedLocation,
              geometry: {
                lat: selectedLocation.geometry?.lat || 0,
                lng: selectedLocation.geometry?.lng || 0,
              },
            }
          : null;

        await addDoc(collection(db, "trips", tripId, "cities"), cityData);
      }

      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} city:`, error);
      setError(
        `Failed to ${isEditing ? "update" : "add"} city. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      <div className="modal-content relative bg-[var(--tw-subbackground)] rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[var(--tw-border)]">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--tw-text)]">
            {isEditing ? "Edit City" : "Add City to Visit"}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div
          className="overflow-y-auto flex-1 p-4 sm:p-6"
          style={{ scrollbarColor: "var(--tw-border) transparent" }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <div className="relative">
              <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)] text-sm sm:text-base">
                City Name *
              </label>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={canEditName ? handleLocationChange : handleChange}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors ${
                    !canEditName ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  placeholder={
                    canEditName ? "Search for a city..." : formData.name
                  }
                  disabled={isSubmitting || !canEditName}
                  autoComplete="off"
                  required
                />
                {isSearchingLocations && canEditName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="animate-spin h-4 w-4 text-[var(--tw-focus)]" />
                  </div>
                )}
              </div>

              {!canEditName && (
                <p className="text-xs text-[var(--tw-text)] opacity-70 mt-1">
                  Arrival and departure cities cannot be changed
                </p>
              )}

              {showSuggestions &&
                locationSuggestions.length > 0 &&
                canEditName && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-lg shadow-lg max-h-52 sm:max-h-60 overflow-y-auto"
                  >
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2.5 hover:bg-[var(--tw-field)] transition-colors border-b border-[var(--tw-border)] last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--tw-focus)]" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--tw-text)] truncate">
                              {suggestion.components.city ||
                                suggestion.components.town ||
                                suggestion.components.village ||
                                suggestion.formatted.split(",")[0]}
                            </div>
                            <div className="text-xs sm:text-sm text-[var(--tw-text)] opacity-70 truncate">
                              {suggestion.formatted}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <div>
              <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)] text-sm sm:text-base">
                Duration (days) *
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d+$/.test(value)) {
                    const numValue = value === "" ? "" : parseInt(value);
                    if (
                      value === "" ||
                      (numValue >= 1 && numValue <= maxDuration)
                    ) {
                      handleChange(e);
                    }
                  }
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                min="1"
                max={maxDuration}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                disabled={isSubmitting}
                required
                placeholder="Enter number of days"
              />
              <p className="text-xs text-[var(--tw-text)] opacity-70 mt-1">
                Available days: {maxDuration}
              </p>
            </div>

            <div className="mb-0">
              <label className="block mb-1.5 sm:mb-2 font-medium text-[var(--tw-text)] text-sm sm:text-base">
                Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] border-[var(--tw-border)] focus:border-[var(--tw-text)] placeholder-opacity-60 transition-colors resize-none"
                placeholder="Why do you want to visit this city?"
                disabled={isSubmitting}
                autoComplete="off"
              />
            </div>
          </form>
        </div>

        <div className="border-t border-[var(--tw-border)] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2.5 border border-[var(--tw-border)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-field)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="cursor-pointer bg-[var(--tw-focus)] text-white px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting || maxDuration <= 0}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>{isEditing ? "Updating..." : "Adding..."}</span>
                </>
              ) : (
                <span>{isEditing ? "Update City" : "Add City"}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

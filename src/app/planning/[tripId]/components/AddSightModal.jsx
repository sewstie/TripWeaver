"use client";
import { useState, useEffect, useRef } from "react";
import { X, MapPin } from "lucide-react";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { geocodeLocation } from "@/lib/geocoding";
import { createScrollLock } from "@/lib/utils/modalUtils";

export default function AddSightModal({
  tripId,
  day,
  editingSight,
  onClose,
  trip,
  onSightAdded,
}) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    notes: "",
  });
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const currentScrollY = window.scrollY;
    setScrollY(currentScrollY);

    const removeScrollLock = createScrollLock();
    return removeScrollLock;
  }, []);

  useEffect(() => {
    if (editingSight) {
      setFormData({
        name: editingSight.name || "",
        location: editingSight.location || "",
        notes: editingSight.notes || "",
      });
      if (editingSight.coordinates) {
        setSelectedCoordinates(editingSight.coordinates);
      }
    }
  }, [editingSight]);

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

  const getCityFromTrip = () => {
    if (!trip) return null;

    if (trip.destination) {
      return trip.destination.split(",")[0].trim();
    }

    if (trip.locationDetails?.formatted) {
      return trip.locationDetails.formatted.split(",")[0].trim();
    }

    if (trip.locationDetails?.components?.city) {
      return trip.locationDetails.components.city;
    }

    if (trip.location) {
      return trip.location.split(",")[0].trim();
    }

    if (trip.name && trip.name.toLowerCase().includes(" to ")) {
      const match = trip.name.match(/to\s+([^,]+)/i);
      if (match) {
        return match[1].trim();
      }
    }

    return null;
  };

  const searchLocationSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocations(true);

    try {
      const cityName = getCityFromTrip();

      let apiUrl = `/api/places?query=${encodeURIComponent(query)}`;
      if (cityName) {
        apiUrl += `&city=${encodeURIComponent(cityName)}`;
      }

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setLocationSuggestions(data.results);
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
    setFormData((prev) => ({
      ...prev,
      location: value,
    }));

    setSelectedCoordinates(null);

    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchLocationSuggestions(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  const handleSelectSuggestion = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      location: suggestion.formatted,
      name: prev.name || suggestion.name,
    }));

    setSelectedCoordinates({
      lat: suggestion.geometry.lat,
      lng: suggestion.geometry.lng,
    });

    setShowSuggestions(false);
    setLocationSuggestions([]);
    locationInputRef.current?.focus();
  };

  const formatSuggestionDisplay = (suggestion) => {
    const { types } = suggestion;

    let category = "Place";
    let iconColor = "text-[var(--tw-focus)]";

    if (types.includes("tourist_attraction")) {
      category = "Tourist Attraction";
      iconColor = "text-blue-500";
    } else if (types.includes("museum")) {
      category = "Museum";
      iconColor = "text-purple-500";
    } else if (types.includes("restaurant")) {
      category = "Restaurant";
      iconColor = "text-orange-500";
    } else if (types.includes("lodging")) {
      category = "Hotel";
      iconColor = "text-green-500";
    } else if (types.includes("park")) {
      category = "Park";
      iconColor = "text-green-600";
    } else if (
      types.includes("church") ||
      types.includes("hindu_temple") ||
      types.includes("mosque") ||
      types.includes("synagogue")
    ) {
      category = "Religious Site";
      iconColor = "text-yellow-600";
    } else if (types.includes("shopping_mall") || types.includes("store")) {
      category = "Shopping";
      iconColor = "text-pink-500";
    }

    return {
      primary: suggestion.name,
      secondary: category,
      rating: suggestion.rating,
      iconColor,
    };
  };

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

      let finalCoordinates = selectedCoordinates;

      if (!finalCoordinates && formData.location.trim()) {
        const geocodedResult = await geocodeLocation(formData.location.trim());
        if (geocodedResult) {
          finalCoordinates = {
            lat: geocodedResult.lat,
            lng: geocodedResult.lng,
          };
        }
      }

      if (finalCoordinates) {
        sightData.coordinates = finalCoordinates;
      }

      let updatedSight = null;

      if (editingSight) {
        await updateDoc(
          doc(db, "trips", tripId, "itineraryItems", editingSight.id),
          sightData
        );

        updatedSight = {
          id: editingSight.id,
          ...sightData,
        };
      } else {
        const docRef = await addDoc(
          collection(db, "trips", tripId, "itineraryItems"),
          sightData
        );

        updatedSight = {
          id: docRef.id,
          ...sightData,
        };
      }

      if (onSightAdded && updatedSight && updatedSight.coordinates) {
        onSightAdded(updatedSight);
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

  const getCityName = () => {
    const city = getCityFromTrip();
    return city || "your destination";
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        height: "100vh",
        marginTop: `${scrollY}px`,
      }}
    >
      <div className="fixed inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col z-10">
        <div className="flex justify-between items-center p-6 border-b border-[var(--tw-border)]">
          <h2 className="text-xl font-bold text-[var(--tw-text)]">
            {editingSight ? "Edit Sight" : "Add New Sight"}
          </h2>
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
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)]"
                placeholder="e.g., Eiffel Tower"
                disabled={isSubmitting}
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
                Location *
              </label>
              <div className="relative">
                <input
                  ref={locationInputRef}
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  onFocus={() =>
                    formData.location.length >= 2 && setShowSuggestions(true)
                  }
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)]"
                  placeholder={`Search attractions in ${getCityName()}...`}
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                {isSearchingLocations && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--tw-focus)]"></div>
                  </div>
                )}
              </div>

              {showSuggestions && locationSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-10 w-full mt-1 bg-[var(--tw-background)] border border-[var(--tw-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                  {locationSuggestions.map((suggestion, index) => {
                    const display = formatSuggestionDisplay(suggestion);
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-[var(--tw-field)] transition-colors border-b border-[var(--tw-border)] last:border-b-0"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${display.iconColor}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[var(--tw-text)] truncate">
                              {display.primary}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-[var(--tw-text)] opacity-70">
                                {display.secondary}
                              </span>
                              {display.rating && (
                                <span className="text-sm text-yellow-500">
                                  ⭐ {display.rating}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-xs text-[var(--tw-text)] opacity-70 mt-1">
                Search for attractions, restaurants, and places in{" "}
                {getCityName()}
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
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)] resize-none"
                placeholder="Additional notes or details..."
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>

        <div className="border-t border-[var(--tw-border)] p-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2 border border-[var(--tw-focus)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-subbackground)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="cursor-pointer flex-1 px-4 py-2 bg-[var(--tw-focus)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : editingSight ? "Update" : "Add"}
            </button>
          </div>
        </div>

        <style jsx>{`
          .placeholder-custom::placeholder {
            color: var(--tw-text);
            opacity: 0.6;
          }
        `}</style>
      </div>
    </div>
  );
}

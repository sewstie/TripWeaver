"use client";
import { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, MapPin, Loader2 } from "lucide-react";

export default function AddCityModal({
  tripId,
  onClose,
  availableDays,
  existingCities,
  trip,
}) {
  const [formData, setFormData] = useState({
    name: "",
    duration: Math.min(3, Math.max(1, availableDays)),
    notes: "",
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const locationInputRef = useRef(null);
  const suggestionsRef = useRef(null);

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

    if (formData.duration < 1 || formData.duration > availableDays) {
      setError(`Duration must be between 1 and ${availableDays} days`);
      return;
    }

    const regularCities = existingCities.filter(
      (c) => !c.isArrivalCity && !c.isDepartureCity
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
        order: existingCities.filter(
          (c) => !c.isArrivalCity && !c.isDepartureCity
        ).length,
        createdAt: serverTimestamp(),
        locationDetails: selectedLocation
          ? {
              ...selectedLocation,
              geometry: {
                lat: selectedLocation.geometry?.lat || 0,
                lng: selectedLocation.geometry?.lng || 0,
              },
            }
          : null,
      };

      await addDoc(collection(db, "trips", tripId, "cities"), cityData);
      onClose();
    } catch (error) {
      console.error("Error adding city:", error);
      setError("Failed to add city. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-black opacity-50 backdrop-blur-sm"></div>
      <div className="bg-[var(--tw-background)] rounded-lg w-full max-w-md relative z-10">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-[var(--tw-text)]">
            Add City to Visit
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer p-1 rounded-lg hover:bg-[var(--tw-subbackground)] transition-colors"
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

          <div className="relative">
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              City Name *
            </label>
            <div className="relative">
              <input
                ref={locationInputRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleLocationChange}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)]"
                placeholder="Search for a city..."
                disabled={isSubmitting}
                autoComplete="off"
              />
              {isSearchingLocations && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="animate-spin h-4 w-4 text-[var(--tw-focus)]" />
                </div>
              )}
            </div>

            {showSuggestions && locationSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-10 w-full mt-1 bg-[var(--tw-background)] border border-[var(--tw-border)] rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {locationSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-[var(--tw-field)] transition-colors border-b border-[var(--tw-border)] last:border-b-0"
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
                        <div className="text-sm text-[var(--tw-text)] opacity-70 truncate">
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
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              Duration (days) *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              max={availableDays}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-[var(--tw-text)] opacity-70 mt-1">
              Available days: {availableDays}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-1">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border border-[var(--tw-border)] text-[var(--tw-text)] resize-none"
              placeholder="Why do you want to visit this city? What are you hoping to see?"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 px-4 py-2 border border-[var(--tw-focus)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-subbackground)] transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer flex-1 px-4 py-2 bg-[var(--tw-focus)] text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || availableDays <= 0}
            >
              {isSubmitting ? "Adding..." : "Add City"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

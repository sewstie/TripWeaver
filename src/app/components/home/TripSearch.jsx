"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/app/components/ui/calendar";
import { Button } from "@/app/components/ui/button";
import { CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, collection, addDoc, serverTimestamp } from "@/lib/firebase";

export default function TripSearch() {
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: undefined,
    endDate: undefined,
    tripType: "simple",
    arrivalCity: "",
    departureCity: "",
    cities: [],
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedArrivalLocation, setSelectedArrivalLocation] = useState(null);
  const [selectedDepartureLocation, setSelectedDepartureLocation] =
    useState(null);
  const [selectedCities, setSelectedCities] = useState([]);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [transportSearchResults, setTransportSearchResults] = useState([]);
  const [currentSearchType, setCurrentSearchType] = useState("");
  const searchResultsRef = useRef(null);

  const startDateBtnRef = useRef(null);
  const endDateBtnRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const destinationInputRef = useRef(null);

  const { currentUser } = useAuth();
  const router = useRouter();

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

      if (
        !destinationInputRef.current?.contains(e.target) &&
        !searchResultsRef.current?.contains(e.target)
      ) {
        setSearchResults([]);
      }

      // Clear city search results when clicking outside
      setCitySearchResults([]);
      setCurrentSearchType("");
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (
      searchData.startDate &&
      searchData.endDate &&
      searchData.endDate < searchData.startDate
    ) {
      setSearchData((prev) => ({ ...prev, endDate: searchData.startDate }));
    }
  }, [searchData.startDate]);

  const handleTripTypeChange = (type) => {
    setSearchData((prev) => ({
      ...prev,
      tripType: type,
      arrivalCity: type === "simple" ? "" : prev.arrivalCity,
      departureCity: type === "simple" ? "" : prev.departureCity,
      cities: type === "simple" ? [] : prev.cities,
    }));

    if (type === "simple") {
      setSelectedCities([]);
      setSelectedArrivalLocation(null);
      setSelectedDepartureLocation(null);
    }
  };

  const handleCitySearch = async (query, type = "cities") => {
    if (query.length < 2) {
      setCitySearchResults([]);
      setCurrentSearchType("");
      return;
    }

    setCurrentSearchType(type);
    setIsSearchingCities(true);

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query
        )}&key=${
          process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
        }&limit=10&no_annotations=1&language=en&roadinfo=0&address_only=1`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const cityResults = data.results.filter(
          (result) =>
            (result.components.city ||
              result.components.town ||
              result.components.village ||
              result.components.county ||
              result.components.state) &&
            result.components.country &&
            !result.components.road &&
            !result.components.house_number &&
            !result.components.postcode_only
        );
        setCitySearchResults(cityResults);
      } else {
        setCitySearchResults([]);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      setCitySearchResults([]);
    }
    setIsSearchingCities(false);
  };

  const handleAddCity = (city) => {
    const cityData = {
      id: Date.now(),
      name: city.formatted,
      coordinates: {
        lat: city.geometry.lat,
        lng: city.geometry.lng,
      },
    };

    setSelectedCities((prev) => [...prev, cityData]);
    setSearchData((prev) => ({
      ...prev,
      cities: [...prev.cities, cityData],
    }));
    setCitySearchResults([]);
  };

  const handleRemoveCity = (cityId) => {
    setSelectedCities((prev) => prev.filter((city) => city.id !== cityId));
    setSearchData((prev) => ({
      ...prev,
      cities: prev.cities.filter((city) => city.id !== cityId),
    }));
  };

  const handleTransportSearch = async (query, type) => {
    if (query.length < 3) {
      setTransportSearchResults([]);
      return;
    }

    setCurrentSearchType(type);
    setIsSearchingCities(true);

    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
          query + " airport OR train station OR bus station"
        )}&key=${
          process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
        }&limit=8&no_annotations=1&language=en`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const transportResults = data.results.filter(
          (result) =>
            result.formatted.toLowerCase().includes("airport") ||
            result.formatted.toLowerCase().includes("train") ||
            result.formatted.toLowerCase().includes("bus") ||
            result.formatted.toLowerCase().includes("station") ||
            result.formatted.toLowerCase().includes("terminal") ||
            result.components._type === "aeroway"
        );
        setTransportSearchResults(
          transportResults.length > 0
            ? transportResults
            : data.results.slice(0, 5)
        );
      } else {
        setTransportSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching transport hubs:", error);
      setTransportSearchResults([]);
    }
    setIsSearchingCities(false);
  };

  const validateForm = () => {
    const errors = {};

    if (searchData.tripType === "simple") {
      if (!selectedLocation || !searchData.destination.trim()) {
        errors.destination = "Please select a destination city";
      }
    } else {
      if (!searchData.arrivalCity.trim()) {
        errors.arrivalCity = "Arrival point is required";
      }
      if (!searchData.departureCity.trim()) {
        errors.departureCity = "Departure point is required";
      }
    }

    if (!searchData.startDate) {
      errors.startDate = "Please select a start date";
    }

    if (!searchData.endDate) {
      errors.endDate = "Please select an end date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearValidationError = (field) => {
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "destination") {
      clearValidationError("destination");
      handleDestinationSearch(value);
    }
  };

  const handleDestinationSearch = (query) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
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

          setSearchResults(cityResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setSearchData((prev) => ({ ...prev, destination: location.formatted }));
    setSearchResults([]);
    clearValidationError("destination");
  };

  const formatLocationName = (location) => {
    const components = [];
    if (location.components.city_latin || location.components.city) {
      components.push(
        location.components.city_latin || location.components.city
      );
    } else if (location.components.town_latin || location.components.town) {
      components.push(
        location.components.town_latin || location.components.town
      );
    } else if (
      location.components.village_latin ||
      location.components.village
    ) {
      components.push(
        location.components.village_latin || location.components.village
      );
    }

    if (location.components.state_latin || location.components.state) {
      components.push(
        location.components.state_latin || location.components.state
      );
    }

    if (location.components.country_latin || location.components.country) {
      components.push(
        location.components.country_latin || location.components.country
      );
    }

    return components.join(", ");
  };

  const handleDateChange = (field, date) => {
    setSearchData((prevData) => ({
      ...prevData,
      [field]: date,
    }));
    clearValidationError(field);
  };

  const createTrip = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    setIsCreatingTrip(true);
    setError("");

    try {
      const tripData = {
        name:
          searchData.tripType === "simple"
            ? `Trip to ${
                selectedLocation?.components?.city ||
                selectedLocation?.components?.town ||
                selectedLocation?.formatted
              }`
            : `Multi-City Trip`,
        destination: searchData.destination,
        startDate: searchData.startDate,
        endDate: searchData.endDate,
        createdBy: currentUser.uid,
        ownerId: currentUser.uid,
        collaborators: {
          [currentUser.uid]: "owner",
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        itinerary: [],
        budget: {
          total: 0,
          accommodation: 0,
          transportation: 0,
          activities: 0,
          food: 0,
          other: 0,
        },
        tripType: searchData.tripType,
      };

      if (searchData.tripType === "simple") {
        tripData.locationDetails = {
          ...selectedLocation,
          geometry: {
            lat: selectedLocation.geometry?.lat || 0,
            lng: selectedLocation.geometry?.lng || 0,
          },
        };
      } else {
        tripData.arrivalPoint = {
          name: searchData.arrivalCity,
          details: selectedArrivalLocation,
        };
        tripData.departurePoint = {
          name: searchData.departureCity,
          details: selectedDepartureLocation,
        };
        tripData.isMultiCity = true;
        tripData.cities = [];
      }

      const docRef = await addDoc(collection(db, "trips"), tripData);
      router.push(`/planning/${docRef.id}`);
    } catch (error) {
      console.error("Error creating trip:", error);
      setError("Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrip();
  };

  return (
    <section
      id="search-section"
      className="py-20 min-h-screen flex flex-col justify-center bg-[var(--tw-background)] relative"
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--tw-text)]">
            Discover{" "}
            <span className="text-[var(--tw-focus)]">Your Next Adventure</span>
          </h2>
          <p className="text-xl opacity-90 mb-8 text-[var(--tw-text)]">
            From ancient wonders to modern marvels, find the perfect destination
            for your journey. Search, plan, and embark on an unforgettable
            experience with{" "}
            <span className="text-[var(--tw-focus)]">TripWeaver</span>.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl relative"
          style={{ zIndex: 5 }}
        >
          <div className="flex flex-col gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--tw-text)]">
                Trip Type
              </label>
              <div className="flex rounded-lg border border-[var(--tw-border)] p-1">
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("simple")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    searchData.tripType === "simple"
                      ? "bg-[var(--tw-focus)] text-white"
                      : "text-[var(--tw-text)] hover:bg-[var(--tw-field)]"
                  }`}
                >
                  Single City
                </button>
                <button
                  type="button"
                  onClick={() => handleTripTypeChange("multi-city")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    searchData.tripType === "multi-city"
                      ? "bg-[var(--tw-focus)] text-white"
                      : "text-[var(--tw-text)] hover:bg-[var(--tw-field)]"
                  }`}
                >
                  Multi-City
                </button>
              </div>
            </div>

            {searchData.tripType === "simple" ? (
              <div className="w-full">
                <label
                  htmlFor="destination"
                  className="block mb-2 font-medium text-[var(--tw-text)]"
                >
                  Where do you want to go?
                </label>
                <input
                  ref={destinationInputRef}
                  type="text"
                  id="destination"
                  name="destination"
                  placeholder="Search cities..."
                  value={searchData.destination}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 placeholder-custom bg-[var(--tw-field)] border text-[var(--tw-text)] ${
                    validationErrors.destination
                      ? "border-red-500 focus:border-red-500"
                      : "border-[var(--tw-border)] focus:border-[var(--tw-text)]"
                  }`}
                  autoComplete="off"
                />
                {validationErrors.destination && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.destination}
                  </p>
                )}
                {isSearching && (
                  <div className="absolute right-3 top-9">
                    <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-7" />
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div
                    ref={searchResultsRef}
                    className="absolute z-50 mt-1 w-[85%] max-w-md bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg max-h-60 overflow-y-auto"
                  >
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 hover:bg-[var(--tw-subbackground)] hover:bg-opacity-30 cursor-pointer border-b border-[var(--tw-border)] last:border-0 flex items-start"
                        onClick={() => handleSelectLocation(result)}
                      >
                        <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--tw-focus)]" />
                        <div>
                          <p className="font-medium text-[var(--tw-text)]">
                            {formatLocationName(result)}
                          </p>
                          <p className="text-sm text-[var(--tw-text)] opacity-70">
                            {result.formatted}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="w-full relative">
                  <label
                    htmlFor="arrivalCity"
                    className="block mb-2 font-medium text-[var(--tw-text)]"
                  >
                    Arrival City
                  </label>
                  <input
                    type="text"
                    id="arrivalCity"
                    name="arrivalCity"
                    placeholder="Which city are you arriving in?"
                    value={searchData.arrivalCity}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 placeholder-custom bg-[var(--tw-field)] border text-[var(--tw-text)] ${
                      validationErrors.arrivalCity
                        ? "border-red-500 focus:border-red-500"
                        : "border-[var(--tw-border)] focus:border-[var(--tw-text)]"
                    }`}
                    autoComplete="off"
                    onChange={(e) => {
                      setSearchData((prev) => ({
                        ...prev,
                        arrivalCity: e.target.value,
                      }));
                      handleCitySearch(e.target.value, "arrival");
                      clearValidationError("arrivalCity");
                    }}
                    onFocus={() => {
                      if (searchData.arrivalCity.length >= 2) {
                        handleCitySearch(searchData.arrivalCity, "arrival");
                      }
                    }}
                  />
                  {validationErrors.arrivalCity && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.arrivalCity}
                    </p>
                  )}
                  {isSearchingCities && currentSearchType === "arrival" && (
                    <div className="absolute right-3 top-9">
                      <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-7" />
                    </div>
                  )}

                  {citySearchResults.length > 0 &&
                    currentSearchType === "arrival" && (
                      <div className="absolute z-50 mt-1 w-[85%] max-w-md bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {citySearchResults.map((result, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-[var(--tw-subbackground)] hover:bg-opacity-30 cursor-pointer border-b border-[var(--tw-border)] last:border-0 flex items-start"
                            onClick={() => {
                              setSelectedArrivalLocation(result);
                              setSearchData((prev) => ({
                                ...prev,
                                arrivalCity: result.formatted,
                              }));
                              setCitySearchResults([]);
                              setCurrentSearchType("");
                            }}
                          >
                            <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--tw-focus)]" />
                            <div>
                              <p className="font-medium text-[var(--tw-text)]">
                                {formatLocationName(result)}
                              </p>
                              <p className="text-sm text-[var(--tw-text)] opacity-70">
                                {result.formatted}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sameDestination"
                      className="w-4 h-4 text-[var(--tw-focus)] bg-[var(--tw-field)] border-[var(--tw-border)] rounded focus:ring-[var(--tw-focus)]"
                      checked={
                        searchData.departureCity === searchData.arrivalCity
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSearchData((prev) => ({
                            ...prev,
                            departureCity: prev.arrivalCity,
                          }));
                          setSelectedDepartureLocation(selectedArrivalLocation);
                        } else {
                          setSearchData((prev) => ({
                            ...prev,
                            departureCity: "",
                          }));
                          setSelectedDepartureLocation(null);
                        }
                      }}
                    />
                    <label
                      htmlFor="sameDestination"
                      className="text-sm text-[var(--tw-text)]"
                    >
                      Same departure city as arrival
                    </label>
                  </div>

                  {!searchData.arrivalCity ||
                  searchData.departureCity !== searchData.arrivalCity ? (
                    <div className="w-full relative">
                      <label
                        htmlFor="departureCity"
                        className="block mb-2 font-medium text-[var(--tw-text)]"
                      >
                        Departure City
                      </label>
                      <input
                        type="text"
                        id="departureCity"
                        name="departureCity"
                        placeholder="Which city are you departing from?"
                        value={searchData.departureCity}
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:border-1.5 placeholder-custom bg-[var(--tw-field)] border text-[var(--tw-text)] ${
                          validationErrors.departureCity
                            ? "border-red-500 focus:border-red-500"
                            : "border-[var(--tw-border)] focus:border-[var(--tw-text)]"
                        }`}
                        autoComplete="off"
                        onChange={(e) => {
                          setSearchData((prev) => ({
                            ...prev,
                            departureCity: e.target.value,
                          }));
                          handleCitySearch(e.target.value, "departure");
                          clearValidationError("departureCity");
                        }}
                        onFocus={() => {
                          if (searchData.departureCity.length >= 2) {
                            handleCitySearch(
                              searchData.departureCity,
                              "departure"
                            );
                          }
                        }}
                      />
                      {validationErrors.departureCity && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.departureCity}
                        </p>
                      )}
                      {isSearchingCities &&
                        currentSearchType === "departure" && (
                          <div className="absolute right-3 top-9">
                            <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-7" />
                          </div>
                        )}

                      {citySearchResults.length > 0 &&
                        currentSearchType === "departure" && (
                          <div className="absolute z-50 mt-1 w-[85%] max-w-md bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg max-h-48 overflow-hidden">
                            <div className="overflow-y-auto max-h-48">
                              {citySearchResults.map((result, index) => (
                                <div
                                  key={index}
                                  className="p-3 hover:bg-[var(--tw-subbackground)] hover:bg-opacity-30 cursor-pointer border-b border-[var(--tw-border)] last:border-0 flex items-start"
                                  onClick={() => {
                                    setSelectedDepartureLocation(result);
                                    setSearchData((prev) => ({
                                      ...prev,
                                      departureCity: result.formatted,
                                    }));
                                    setCitySearchResults([]);
                                    setCurrentSearchType("");
                                  }}
                                >
                                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--tw-focus)]" />
                                  <div>
                                    <p className="font-medium text-[var(--tw-text)]">
                                      {formatLocationName(result)}
                                    </p>
                                    <p className="text-sm text-[var(--tw-text)] opacity-70">
                                      {result.formatted}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : null}
                </div>
              </>
            )}

            <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[200px] relative">
                <label
                  htmlFor="startDate"
                  className="block mb-2 font-medium text-[var(--tw-text)]"
                >
                  Start Date
                </label>
                <Button
                  ref={startDateBtnRef}
                  type="button"
                  variant="outline"
                  className={`w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] ${
                    validationErrors.startDate
                      ? "border-red-500"
                      : "border-[var(--tw-border)] text-[var(--tw-text)]"
                  }`}
                  onClick={() => {
                    setStartDateOpen(!startDateOpen);
                    setEndDateOpen(false);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchData.startDate ? (
                    format(searchData.startDate, "PPP")
                  ) : (
                    <span>Select start date</span>
                  )}
                </Button>
                {validationErrors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.startDate}
                  </p>
                )}

                {startDateOpen && (
                  <div
                    ref={startCalendarRef}
                    className="absolute z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-2 top-[calc(100%+5px)] left-0 w-full min-w-[280px]"
                  >
                    <Calendar
                      mode="single"
                      selected={searchData.startDate}
                      onSelect={(date) => {
                        handleDateChange("startDate", date);
                        setStartDateOpen(false);
                      }}
                      disabled={(date) => date < new Date()}
                      className="text-[var(--tw-text)]"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-[200px] relative">
                <label
                  htmlFor="endDate"
                  className="block mb-2 font-medium text-[var(--tw-text)]"
                >
                  End Date
                </label>
                <Button
                  ref={endDateBtnRef}
                  type="button"
                  variant="outline"
                  className={`w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] ${
                    validationErrors.endDate
                      ? "border-red-500"
                      : "border-[var(--tw-border)] text-[var(--tw-text)]"
                  }`}
                  onClick={() => {
                    setEndDateOpen(!endDateOpen);
                    setStartDateOpen(false);
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {searchData.endDate ? (
                    format(searchData.endDate, "PPP")
                  ) : (
                    <span>Select end date</span>
                  )}
                </Button>
                {validationErrors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.endDate}
                  </p>
                )}

                {endDateOpen && (
                  <div
                    ref={endCalendarRef}
                    className="absolute z-[200] bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg p-2 top-[calc(100%+5px)] left-0 w-full min-w-[280px]"
                  >
                    <Calendar
                      mode="single"
                      selected={searchData.endDate}
                      onSelect={(date) => {
                        handleDateChange("endDate", date);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) =>
                        date < new Date() ||
                        (searchData.startDate
                          ? date < searchData.startDate
                          : false)
                      }
                      className="text-[var(--tw-text)]"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-[200px] flex items-end">
                <button
                  type="submit"
                  className="cursor-pointer w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white"
                >
                  {isCreatingTrip ? "Creating Trip..." : "Start Planning"}
                </button>
              </div>
            </div>
          </div>
        </form>
        <div className="mt-12 text-center">
          <p className="text-lg opacity-90 text-[var(--tw-text)]">
            Popular destinations:{" "}
            <span className="text-[var(--tw-focus)]">Paris</span>,
            <span className="text-[var(--tw-focus)]"> Tokyo</span>,
            <span className="text-[var(--tw-focus)]"> New York</span>,
            <span className="text-[var(--tw-focus)]"> Bali</span>,
            <span className="text-[var(--tw-focus)]"> Rome</span>
          </p>
        </div>
      </div>

      <style jsx>{`
        .placeholder-custom::placeholder {
          color: var(--tw-text);
          opacity: 0.6;
        }
      `}</style>
    </section>
  );
}

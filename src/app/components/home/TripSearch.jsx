"use client";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/app/components/ui/calendar";
import { Button } from "@/app/components/ui/button";
import { CalendarIcon, Loader2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db, collection, addDoc, serverTimestamp } from "@/lib/firebase";

export default function TripSearch() {
  const [tripType, setTripType] = useState("simple");
  const [searchData, setSearchData] = useState({
    destination: "",
    startDate: undefined,
    endDate: undefined,
  });
  const [advancedTripData, setAdvancedTripData] = useState({
    arrivalCity: null,
    departureCity: null,
    startDate: undefined,
    endDate: undefined,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [arrivalCityInput, setArrivalCityInput] = useState("");
  const [departureCityInput, setDepartureCityInput] = useState("");
  const [sameAsDeparture, setSameAsDeparture] = useState(true);

  const searchResultsRef = useRef(null);
  const startDateBtnRef = useRef(null);
  const endDateBtnRef = useRef(null);
  const startCalendarRef = useRef(null);
  const endCalendarRef = useRef(null);
  const destinationInputRef = useRef(null);
  const arrivalCityInputRef = useRef(null);
  const departureCityInputRef = useRef(null);

  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (sameAsDeparture && advancedTripData.arrivalCity) {
      setAdvancedTripData((prev) => ({
        ...prev,
        departureCity: prev.arrivalCity,
      }));
      setDepartureCityInput(arrivalCityInput);
      clearValidationError("departureCity");
    }
  }, [sameAsDeparture, advancedTripData.arrivalCity, arrivalCityInput]);

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
        !arrivalCityInputRef.current?.contains(e.target) &&
        !departureCityInputRef.current?.contains(e.target) &&
        !searchResultsRef.current?.contains(e.target)
      ) {
        setSearchResults([]);
        setActiveSearchField(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const currentData = tripType === "simple" ? searchData : advancedTripData;
    if (
      currentData.startDate &&
      currentData.endDate &&
      currentData.endDate < currentData.startDate
    ) {
      if (tripType === "simple") {
        setSearchData((prev) => ({ ...prev, endDate: currentData.startDate }));
      } else {
        setAdvancedTripData((prev) => ({
          ...prev,
          endDate: currentData.startDate,
        }));
      }
    }
  }, [
    tripType === "simple" ? searchData.startDate : advancedTripData.startDate,
    tripType,
  ]);

  const validateForm = () => {
    const errors = {};

    if (tripType === "simple") {
      if (!selectedLocation || !searchData.destination.trim()) {
        errors.destination = "Please select a destination city";
      }
      if (!searchData.startDate) {
        errors.startDate = "Please select a start date";
      }
      if (!searchData.endDate) {
        errors.endDate = "Please select an end date";
      }
    } else {
      if (!advancedTripData.arrivalCity) {
        errors.arrivalCity = "Please select an arrival city";
      }
      if (!sameAsDeparture && !advancedTripData.departureCity) {
        errors.departureCity = "Please select a departure city";
      }
      if (!advancedTripData.startDate) {
        errors.startDate = "Please select a start date";
      }
      if (!advancedTripData.endDate) {
        errors.endDate = "Please select an end date";
      }
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
      setSelectedLocation(null);
      handleDestinationSearch(value, "destination");
    }
  };

  const handleAdvancedInputChange = (field, value) => {
    clearValidationError(field);

    if (field === "arrivalCity") {
      setArrivalCityInput(value);
      setAdvancedTripData((prev) => ({ ...prev, arrivalCity: null }));

      if (sameAsDeparture) {
        setDepartureCityInput(value);
        setAdvancedTripData((prev) => ({ ...prev, departureCity: null }));
      }
    } else if (field === "departureCity" && !sameAsDeparture) {
      setDepartureCityInput(value);
      setAdvancedTripData((prev) => ({ ...prev, departureCity: null }));
    }

    if (!(field === "departureCity" && sameAsDeparture)) {
      handleDestinationSearch(value, field);
    }
  };

  const handleSameAsDepartureChange = (checked) => {
    setSameAsDeparture(checked);

    if (checked && advancedTripData.arrivalCity) {
      setAdvancedTripData((prev) => ({
        ...prev,
        departureCity: prev.arrivalCity,
      }));
      setDepartureCityInput(arrivalCityInput);
      clearValidationError("departureCity");
    } else if (!checked) {
      setAdvancedTripData((prev) => ({
        ...prev,
        departureCity: null,
      }));
      setDepartureCityInput("");
    }
  };

  const handleDestinationSearch = async (query, fieldType = "destination") => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSearchResults([]);
      setActiveSearchField(null);
      return;
    }

    setActiveSearchField(fieldType);

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

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        setSearchResults([]);
        setError("Failed to search locations. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300);
    setSearchTimeout(timeout);
  };

  const handleSelectLocation = (location) => {
    if (tripType === "simple") {
      setSelectedLocation(location);
      setSearchData((prev) => ({ ...prev, destination: location.formatted }));
      clearValidationError("destination");
    } else {
      if (activeSearchField === "arrivalCity") {
        setAdvancedTripData((prev) => ({ ...prev, arrivalCity: location }));
        setArrivalCityInput(location.formatted);
        clearValidationError("arrivalCity");

        if (sameAsDeparture) {
          setAdvancedTripData((prev) => ({ ...prev, departureCity: location }));
          setDepartureCityInput(location.formatted);
          clearValidationError("departureCity");
        }
      } else if (activeSearchField === "departureCity" && !sameAsDeparture) {
        setAdvancedTripData((prev) => ({ ...prev, departureCity: location }));
        setDepartureCityInput(location.formatted);
        clearValidationError("departureCity");
      }
    }

    setSearchResults([]);
    setActiveSearchField(null);
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
    if (tripType === "simple") {
      setSearchData((prevData) => ({
        ...prevData,
        [field]: date,
      }));
    } else {
      setAdvancedTripData((prevData) => ({
        ...prevData,
        [field]: date,
      }));
    }
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
      let newTrip;

      if (tripType === "simple") {
        if (!selectedLocation) {
          setError("Please select a destination from the dropdown");
          return;
        }

        const cityName =
          selectedLocation.components?.city ||
          selectedLocation.components?.town ||
          selectedLocation.components?.village ||
          selectedLocation.formatted.split(",")[0];

        newTrip = {
          type: "simple",
          title: `Trip to ${cityName}`,
          name: `Trip to ${cityName}`,
          destination: selectedLocation.formatted,
          locationDetails: {
            ...selectedLocation,
            geometry: {
              lat: selectedLocation.geometry?.lat || 0,
              lng: selectedLocation.geometry?.lng || 0,
            },
          },
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
        };
      } else {
        if (
          !advancedTripData.arrivalCity ||
          (!sameAsDeparture && !advancedTripData.departureCity)
        ) {
          setError("Please select valid cities from the dropdown");
          return;
        }

        const arrivalCityName =
          advancedTripData.arrivalCity.components?.city ||
          advancedTripData.arrivalCity.components?.town ||
          advancedTripData.arrivalCity.components?.village ||
          advancedTripData.arrivalCity.formatted.split(",")[0];

        newTrip = {
          type: "advanced",
          title: `Trip to ${arrivalCityName}`,
          name: `Trip to ${arrivalCityName}`,
          arrivalCity: {
            ...advancedTripData.arrivalCity,
            geometry: {
              lat: advancedTripData.arrivalCity.geometry?.lat || 0,
              lng: advancedTripData.arrivalCity.geometry?.lng || 0,
            },
          },
          departureCity: {
            ...advancedTripData.departureCity,
            geometry: {
              lat: advancedTripData.departureCity.geometry?.lat || 0,
              lng: advancedTripData.departureCity.geometry?.lng || 0,
            },
          },
          isRoundTrip: sameAsDeparture,
          startDate: advancedTripData.startDate,
          endDate: advancedTripData.endDate,
          createdBy: currentUser.uid,
          ownerId: currentUser.uid,
          collaborators: {
            [currentUser.uid]: "owner",
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          cities: [],
          budget: {
            total: 0,
            accommodation: 0,
            transportation: 0,
            activities: 0,
            food: 0,
            other: 0,
          },
        };
      }

      const docRef = await addDoc(collection(db, "trips"), newTrip);
      router.push(`/planning/${docRef.id}`);
    } catch (error) {
      setError("Failed to create trip. Please try again.");
    } finally {
      setIsCreatingTrip(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createTrip();
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    setError("");
    setValidationErrors({});
    setSearchResults([]);
    setActiveSearchField(null);

    if (type === "simple") {
      setSearchData({
        destination: "",
        startDate: undefined,
        endDate: undefined,
      });
      setSelectedLocation(null);
    } else {
      setAdvancedTripData({
        arrivalCity: null,
        departureCity: null,
        startDate: undefined,
        endDate: undefined,
      });
      setArrivalCityInput("");
      setDepartureCityInput("");
      setSameAsDeparture(true);
    }
  };

  const currentData = tripType === "simple" ? searchData : advancedTripData;

  const getDropdownPosition = () => {
    let activeInputRef;

    if (activeSearchField === "destination") {
      activeInputRef = destinationInputRef;
    } else if (activeSearchField === "arrivalCity") {
      activeInputRef = arrivalCityInputRef;
    } else if (activeSearchField === "departureCity") {
      activeInputRef = departureCityInputRef;
    }

    if (activeInputRef?.current) {
      const rect = activeInputRef.current.getBoundingClientRect();
      const formRect = activeInputRef.current
        .closest("form")
        .getBoundingClientRect();

      return {
        top: rect.bottom - formRect.top + 5,
        left: rect.left - formRect.left,
        width: rect.width,
      };
    }

    return { top: 120, left: 0, width: 300 };
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

        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => handleTripTypeChange("simple")}
              className={`cursor-pointer w-40 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                tripType === "simple"
                  ? "bg-[var(--tw-focus)] text-white"
                  : "bg-[var(--tw-subbackground)] text-[var(--tw-text)] hover:bg-opacity-80"
              }`}
            >
              Single City
            </button>
            <button
              type="button"
              onClick={() => handleTripTypeChange("advanced")}
              className={`cursor-pointer w-40 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                tripType === "advanced"
                  ? "bg-[var(--tw-focus)] text-white"
                  : "bg-[var(--tw-subbackground)] text-[var(--tw-text)] hover:bg-opacity-80"
              }`}
            >
              Advanced Trip
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl relative z-5"
        >
          {tripType === "simple" ? (
            <div className="flex flex-col gap-6 mb-6">
              <div className="w-full relative">
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
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] placeholder-opacity-60 ${
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
                {isSearching && activeSearchField === "destination" && (
                  <div className="absolute right-3 top-9">
                    <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-70" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px] relative">
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
                    Start Date
                  </label>
                  <Button
                    ref={startDateBtnRef}
                    type="button"
                    variant="outline"
                    className={`cursor-pointer w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] ${
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
                    {currentData.startDate ? (
                      format(currentData.startDate, "PPP")
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
                        selected={currentData.startDate}
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
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
                    End Date
                  </label>
                  <Button
                    ref={endDateBtnRef}
                    type="button"
                    variant="outline"
                    className={`cursor-pointer w-full px-4 py-2 justify-start text-left font-normal bg-[var(--tw-field)] border hover:bg-[var(--tw-field)] hover:text-[var(--tw-text)] ${
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
                    {currentData.endDate ? (
                      format(currentData.endDate, "PPP")
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
                        selected={currentData.endDate}
                        onSelect={(date) => {
                          handleDateChange("endDate", date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date() ||
                          (currentData.startDate
                            ? date < currentData.startDate
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
                    disabled={isCreatingTrip}
                    className="cursor-pointer w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTrip ? "Creating Trip..." : "Start Planning"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
                    Arrival City
                  </label>
                  <input
                    ref={arrivalCityInputRef}
                    type="text"
                    placeholder="Where will you arrive?"
                    value={arrivalCityInput}
                    onChange={(e) =>
                      handleAdvancedInputChange("arrivalCity", e.target.value)
                    }
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] placeholder-opacity-60 ${
                      validationErrors.arrivalCity
                        ? "border-red-500 focus:border-red-500"
                        : "border-[var(--tw-border)] focus:border-[var(--tw-text)]"
                    }`}
                    autoComplete="off"
                  />
                  {validationErrors.arrivalCity && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.arrivalCity}
                    </p>
                  )}
                  {isSearching && activeSearchField === "arrivalCity" && (
                    <div className="absolute right-3 top-9">
                      <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-70" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
                    Departure City
                  </label>
                  <input
                    ref={departureCityInputRef}
                    type="text"
                    placeholder={
                      sameAsDeparture
                        ? "Same as arrival city"
                        : "Where will you depart from?"
                    }
                    value={departureCityInput}
                    onChange={(e) =>
                      handleAdvancedInputChange("departureCity", e.target.value)
                    }
                    disabled={sameAsDeparture}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none bg-[var(--tw-field)] border text-[var(--tw-text)] placeholder-opacity-60 ${
                      sameAsDeparture ? "opacity-50 cursor-not-allowed" : ""
                    } ${
                      validationErrors.departureCity
                        ? "border-red-500 focus:border-red-500"
                        : "border-[var(--tw-border)] focus:border-[var(--tw-text)]"
                    }`}
                    autoComplete="off"
                  />
                  {validationErrors.departureCity && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.departureCity}
                    </p>
                  )}
                  {isSearching &&
                    activeSearchField === "departureCity" &&
                    !sameAsDeparture && (
                      <div className="absolute right-3 top-9">
                        <Loader2 className="animate-spin h-5 w-5 text-[var(--tw-text)] opacity-70" />
                      </div>
                    )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="sameAsDeparture"
                    checked={sameAsDeparture}
                    onChange={(e) =>
                      handleSameAsDepartureChange(e.target.checked)
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor="sameAsDeparture"
                    className="flex items-center cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center transition-all duration-200 ${
                        sameAsDeparture
                          ? "bg-[var(--tw-focus)] border-[var(--tw-focus)]"
                          : "bg-[var(--tw-field)] border-[var(--tw-border)] hover:border-[var(--tw-text)]"
                      }`}
                    >
                      {sameAsDeparture && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="ml-3 text-[var(--tw-text)] text-sm font-medium">
                      Departure city same as arrival city
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                <div className="flex-1 min-w-[200px] relative">
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
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
                    {currentData.startDate ? (
                      format(currentData.startDate, "PPP")
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
                        selected={currentData.startDate}
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
                  <label className="block mb-2 font-medium text-[var(--tw-text)]">
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
                    {currentData.endDate ? (
                      format(currentData.endDate, "PPP")
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
                        selected={currentData.endDate}
                        onSelect={(date) => {
                          handleDateChange("endDate", date);
                          setEndDateOpen(false);
                        }}
                        disabled={(date) =>
                          date < new Date() ||
                          (currentData.startDate
                            ? date < currentData.startDate
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
                    disabled={isCreatingTrip}
                    className="cursor-pointer w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTrip ? "Creating Trip..." : "Start Planning"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {searchResults.length > 0 && activeSearchField && (
            <div
              ref={searchResultsRef}
              className="absolute z-50 bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded-md shadow-lg max-h-60 overflow-y-auto"
              style={{
                top: `${getDropdownPosition().top}px`,
                left: `${getDropdownPosition().left}px`,
                width: `${getDropdownPosition().width}px`,
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-[var(--tw-subbackground)] hover:bg-opacity-30 cursor-pointer border-b border-[var(--tw-border)] last:border-0 flex items-start"
                  onClick={() => handleSelectLocation(result)}
                >
                  <MapPin className="h-5 w-5 mr-2 flex-shrink-0 text-[var(--tw-focus)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--tw-text)] truncate">
                      {formatLocationName(result)}
                    </p>
                    <p className="text-sm text-[var(--tw-text)] opacity-70 truncate">
                      {result.formatted}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
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
    </section>
  );
}

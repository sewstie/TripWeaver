"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import TripHeader from "../TripHeader";
import EditTripModal from "../EditTripModal";
import ManageAccessModal from "../ManageAccessModal";
import CitySetupCard from "./CitySetupCard";
import AddCityModal from "./AddCityModal";
import {
  Plus,
  MapPin,
  Calendar,
  Route,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import CityPlanningView from "./CityPlanningView";

export default function AdvancedTripLayout({
  trip,
  tripId,
  userRole,
  canEdit,
  onEdit,
  onManageAccess,
  onDelete,
  isEditModalOpen,
  onCloseEditModal,
  onTripUpdate,
  isManageAccessModalOpen,
  onCloseManageAccessModal,
}) {
  const [cities, setCities] = useState([]);
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [selectedMapDay, setSelectedMapDay] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, "trips", tripId, "cities"),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const cityData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const existingCityNames = cityData.map((c) => c.name.toLowerCase());
        const arrivalCityName = getDisplayCityName(trip?.arrivalCity);
        const departureCityName = getDisplayCityName(trip?.departureCity);

        const allCities = [...cityData];

        if (trip?.isRoundTrip && arrivalCityName) {
          if (!existingCityNames.includes(arrivalCityName.toLowerCase())) {
            allCities.unshift({
              id: "round-trip-arrival",
              name: arrivalCityName,
              isRoundTripArrival: true,
              duration: 1,
              order: -3,
              locationDetails: trip.arrivalCity,
              notes: "Arrival from your home town",
            });

            allCities.push({
              id: "round-trip-departure",
              name: arrivalCityName,
              isRoundTripDeparture: true,
              duration: 1,
              order: 1001,
              locationDetails: trip.arrivalCity,
              notes: "Departure from your home town",
            });
          }
        } else {
          if (
            arrivalCityName &&
            !existingCityNames.includes(arrivalCityName.toLowerCase())
          ) {
            allCities.unshift({
              id: "arrival-city",
              name: arrivalCityName,
              isArrivalCity: true,
              duration: 0,
              order: -2,
              locationDetails: trip.arrivalCity,
              notes: "Your arrival city",
            });
          }

          if (
            departureCityName &&
            !existingCityNames.includes(departureCityName.toLowerCase()) &&
            departureCityName.toLowerCase() !== arrivalCityName?.toLowerCase()
          ) {
            allCities.push({
              id: "departure-city",
              name: departureCityName,
              isDepartureCity: true,
              duration: 0,
              order: 1000,
              locationDetails: trip.departureCity,
              notes: "Your departure city",
            });
          }
        }

        setCities(allCities.sort((a, b) => a.order - b.order));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching cities:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [tripId, trip]);

  const getDisplayCityName = (cityData) => {
    if (!cityData) return null;
    return (
      cityData.components?.city ||
      cityData.components?.town ||
      cityData.components?.village ||
      cityData.formatted?.split(",")[0]
    );
  };

  const calculateTotalDays = () => {
    if (!trip?.startDate || !trip?.endDate) return 0;
    const start = trip.startDate.toDate
      ? trip.startDate.toDate()
      : new Date(trip.startDate);
    const end = trip.endDate.toDate
      ? trip.endDate.toDate()
      : new Date(trip.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getUsedDays = () => {
    return cities.reduce((sum, city) => {
      return sum + (city.duration || 0);
    }, 0);
  };

  const getAvailableDays = () => {
    const totalDays = calculateTotalDays();
    const usedDays = getUsedDays();
    return Math.max(0, totalDays - usedDays);
  };

  const handleCompleteSetup = async () => {
    try {
      await updateDoc(doc(db, "trips", tripId), {
        setupComplete: true,
        updatedAt: new Date(),
      });
      setSetupComplete(true);
    } catch (error) {
      console.error("Error completing setup:", error);
    }
  };

  const canCompleteSetup = () => {
    const regularCities = cities.filter(
      (c) => !c.isArrivalCity && !c.isDepartureCity
    );
    return regularCities.length > 0 && getAvailableDays() >= 0;
  };

  const handleEditCity = (city) => {
    setEditingCity(city);
  };

  const handleCityClick = (city) => {
    if (
      city.isArrivalCity ||
      city.isDepartureCity ||
      city.isRoundTripArrival ||
      city.isRoundTripDeparture
    ) {
      return;
    }

    setSelectedCity(city);
  };

  const handleBackToOverview = () => {
    setSelectedCity(null);
  };

  const handleSightAdded = (newSight) => {
    if (newSight.coordinates) {
      setMapPoints((prev) => {
        const existingIndex = prev.findIndex(
          (point) => point.id === newSight.id
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            id: newSight.id,
            name: newSight.name,
            location: newSight.location,
            coordinates: newSight.coordinates,
            day: newSight.day,
            notes: newSight.notes,
            cityId: selectedCity?.id,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: newSight.id,
              name: newSight.name,
              location: newSight.location,
              coordinates: newSight.coordinates,
              day: newSight.day,
              notes: newSight.notes,
              cityId: selectedCity?.id,
            },
          ];
        }
      });
    }
  };

  const handleMapDayChange = (dayIndex) => {
    setSelectedMapDay(dayIndex);
  };

  if (selectedCity) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={handleBackToOverview}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--tw-field)] text-[var(--tw-text)] rounded-lg hover:bg-opacity-80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Trip Overview
          </button>
          <h2 className="text-2xl font-bold text-[var(--tw-text)]">
            Planning {selectedCity.name} • {selectedCity.duration}{" "}
            {selectedCity.duration === 1 ? "day" : "days"}
          </h2>
        </div>

        <CityPlanningView
          city={selectedCity}
          tripId={tripId}
          userRole={userRole}
          canEdit={canEdit}
          trip={trip}
          mapPoints={mapPoints.filter(
            (point) => point.cityId === selectedCity.id
          )}
          selectedMapDay={selectedMapDay}
          onMapDayChange={handleMapDayChange}
          handleSightAdded={handleSightAdded}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TripHeader
        trip={trip}
        onEdit={onEdit}
        onManageAccess={onManageAccess}
        onDelete={onDelete}
      />

      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-[var(--tw-focus)] mb-1">
              {calculateTotalDays()}
            </div>
            <div className="text-sm text-[var(--tw-text)] opacity-70">
              Total Days
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {(() => {
                const regularCities = cities.filter(
                  (c) =>
                    !c.isArrivalCity &&
                    !c.isDepartureCity &&
                    !c.isRoundTripArrival &&
                    !c.isRoundTripDeparture
                ).length;

                const arrivalCityName = getDisplayCityName(trip?.arrivalCity);
                const departureCityName = getDisplayCityName(
                  trip?.departureCity
                );

                if (trip?.isRoundTrip) {
                  return regularCities + 1;
                }

                let transitCities = 0;
                if (arrivalCityName) transitCities++;
                if (
                  departureCityName &&
                  departureCityName.toLowerCase() !==
                    arrivalCityName?.toLowerCase()
                ) {
                  transitCities++;
                }

                return regularCities + transitCities;
              })()}
            </div>
            <div className="text-sm text-[var(--tw-text)] opacity-70">
              Cities to Visit
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {getUsedDays()}
            </div>
            <div className="text-sm text-[var(--tw-text)] opacity-70">
              Days Planned
            </div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold mb-1 ${
                getAvailableDays() < 0 ? "text-red-500" : "text-yellow-600"
              }`}
            >
              {getAvailableDays()}
            </div>
            <div className="text-sm text-[var(--tw-text)] opacity-70">
              Days Available
            </div>
          </div>
        </div>

        {getAvailableDays() < 0 && (
          <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">
              ⚠️ You've planned more days than your trip duration. Please adjust
              the duration of your city visits.
            </p>
          </div>
        )}
      </div>

      <div className="bg-[var(--tw-subbackground)] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--tw-text)] mb-4 flex items-center gap-2">
          <Route className="w-5 h-5" />
          Your Journey Route
        </h3>

        <div className="flex items-center gap-2 overflow-x-auto pb-4">
          {cities.map((city, index) => (
            <div
              key={city.id}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {index > 0 && (
                <div className="w-8 h-0.5 bg-[var(--tw-border)]"></div>
              )}
              <div
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  city.isArrivalCity || city.isRoundTripArrival
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : city.isDepartureCity || city.isRoundTripDeparture
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    : "bg-[var(--tw-focus)] text-white"
                }`}
              >
                {(city.isArrivalCity || city.isRoundTripArrival) && "🛬 "}
                {(city.isDepartureCity || city.isRoundTripDeparture) && "🛫 "}
                {city.name}
                {city.duration > 0 && ` (${city.duration}d)`}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="custom-vertical-spacing">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-[var(--tw-text)]">
            Cities & Duration
          </h3>
          {canEdit && (
            <button
              onClick={() => setIsAddCityModalOpen(true)}
              className="cursor-pointer bg-[var(--tw-focus)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add City
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus]"></div>
          </div>
        ) : cities.length === 0 ? (
          <div className="bg-[var(--tw-subbackground)] rounded-lg p-8 text-center">
            <MapPin className="w-12 h-12 text-[var(--tw-text)] opacity-30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[var(--tw-text)] mb-2">
              No Cities Added Yet
            </h3>
            <p className="text-[var(--tw-text)] opacity-70 mb-4">
              Start planning your multi-city journey by adding destinations
              between your arrival and departure cities.
            </p>
            {canEdit && (
              <button
                onClick={() => setIsAddCityModalOpen(true)}
                className="cursor-pointer bg-[var(--tw-focus)] text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Add Your First City
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {cities.map((city) => (
              <CitySetupCard
                key={city.id}
                city={city}
                tripId={tripId}
                canEdit={canEdit}
                totalTrip={trip}
                availableDays={getAvailableDays()}
                onEditCity={handleEditCity}
                onCityClick={handleCityClick}
              />
            ))}
          </div>
        )}
      </div>

      {(isAddCityModalOpen || editingCity) && (
        <AddCityModal
          tripId={tripId}
          onClose={() => {
            setIsAddCityModalOpen(false);
            setEditingCity(null);
          }}
          availableDays={getAvailableDays()}
          existingCities={cities}
          trip={trip}
          editingCity={editingCity}
        />
      )}

      {isEditModalOpen && canEdit && (
        <EditTripModal
          trip={trip}
          onClose={onCloseEditModal}
          onUpdate={onTripUpdate}
        />
      )}

      {isManageAccessModalOpen && (
        <ManageAccessModal trip={trip} onClose={onCloseManageAccessModal} />
      )}
    </div>
  );
}

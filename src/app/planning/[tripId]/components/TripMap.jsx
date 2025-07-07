"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function TripMap({
  mapPoints = [],
  trip,
  selectedDay = 0,
  onDayChange,
  availableDays = [],
  city = null,
}) {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    const loadLeaflet = async () => {
      if (typeof window !== "undefined") {
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        leafletCSS.integrity =
          "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
        leafletCSS.crossOrigin = "";
        document.head.appendChild(leafletCSS);

        const L = (await import("leaflet")).default;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setLeafletLoaded(true);
      }
    };

    loadLeaflet();

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const getDayMapPoints = (dayIndex) => {
    if (dayIndex >= availableDays.length) return [];
    const day = availableDays[dayIndex];
    return mapPoints.filter((point) => point.day === day.dateString);
  };

  const currentDayPoints = getDayMapPoints(selectedDay);

  const getMapCenter = () => {
    if (city?.locationDetails?.geometry) {
      return [
        city.locationDetails.geometry.lat,
        city.locationDetails.geometry.lng,
      ];
    }

    if (city?.name && currentDayPoints.length > 0) {
      return [
        currentDayPoints[0].coordinates.lat,
        currentDayPoints[0].coordinates.lng,
      ];
    }

    if (trip?.locationDetails?.geometry) {
      return [
        trip.locationDetails.geometry.lat,
        trip.locationDetails.geometry.lng,
      ];
    }

    if (mapPoints.length > 0) {
      return [mapPoints[0].coordinates.lat, mapPoints[0].coordinates.lng];
    }

    return [45.4642, 9.19];
  };

  const getMapZoom = () => {
    if (isMobile) {
      return city ? 12 : 11;
    }
    if (city) {
      return 13;
    }
    return 12;
  };

  const handlePreviousDay = () => {
    if (selectedDay > 0) {
      onDayChange(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < availableDays.length - 1) {
      onDayChange(selectedDay + 1);
    }
  };

  const canGoPrevious = () => {
    return selectedDay > 0;
  };

  const canGoNext = () => {
    return selectedDay < availableDays.length - 1;
  };

  if (!isClient || !leafletLoaded) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-60 sm:h-80 bg-[var(--tw-field)] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto mb-4"></div>
            <p className="text-[var(--tw-text)] opacity-70">Loading maps...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[var(--tw-text)]">
              {availableDays[selectedDay]
                ? `Day ${availableDays[selectedDay].dayNumber}`
                : "Day 1"}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--tw-text)] opacity-70">
              {currentDayPoints.length} location
              {currentDayPoints.length !== 1 ? "s" : ""} shown
            </p>
          </div>

          <div className="flex items-center gap-2 self-center">
            <button
              onClick={handlePreviousDay}
              disabled={!canGoPrevious()}
              className={`p-2 rounded-lg transition-colors ${
                canGoPrevious()
                  ? "bg-[var(--tw-field)] cursor-pointer hover:bg-[var(--tw-subbackground)] text-[var(--tw-text)]"
                  : "bg-[var(--tw-field)] cursor-not-allowed opacity-50 text-[var(--tw-text)]"
              }`}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="px-3 sm:px-4 py-1 rounded-lg border border-[var(--tw-focus)] min-w-20 sm:min-w-28 text-center">
              <span className="text-sm sm:text-base text-[var(--tw-text)] font-medium">
                Day {availableDays[selectedDay]?.dayNumber || 1}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              disabled={!canGoNext()}
              className={`p-2 rounded-lg transition-colors ${
                canGoNext()
                  ? "bg-[var(--tw-field)] cursor-pointer hover:bg-[var(--tw-subbackground)] text-[var(--tw-text)]"
                  : "bg-[var(--tw-field)] cursor-not-allowed opacity-50 text-[var(--tw-text)]"
              }`}
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="h-60 sm:h-80 w-full rounded-lg overflow-hidden border border-[var(--tw-border)]">
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            zoomControl={!isMobile}
            attributionControl={!isMobile}
            key={`day-${selectedDay}-${currentDayPoints.length}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {currentDayPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.coordinates.lat, point.coordinates.lng]}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <h3 className="font-bold text-base mb-2">{point.name}</h3>
                    <p className="text-sm mb-2">{point.location}</p>
                    {point.notes && (
                      <p className="text-xs text-gray-600 mb-2">
                        {point.notes}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mt-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-[var(--tw-text)]">
            All Trip Locations
          </h3>
          <p className="text-xs sm:text-sm text-[var(--tw-text)] opacity-70">
            {mapPoints.length} location
            {mapPoints.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <div className="h-60 sm:h-80 w-full rounded-lg overflow-hidden border border-[var(--tw-border)]">
          <MapContainer
            center={getMapCenter()}
            zoom={getMapZoom()}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
            zoomControl={!isMobile}
            attributionControl={!isMobile}
            key={`all-${mapPoints.length}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {mapPoints.map((point) => (
              <Marker
                key={point.id}
                position={[point.coordinates.lat, point.coordinates.lng]}
              >
                <Popup>
                  <div className="p-2 min-w-[180px]">
                    <h3 className="font-bold text-base mb-2">{point.name}</h3>
                    <p className="text-sm mb-2">{point.location}</p>
                    {point.notes && (
                      <p className="text-xs text-gray-600 mb-2">
                        {point.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Day{" "}
                      {availableDays.find((d) => d.dateString === point.day)
                        ?.dayNumber || "?"}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {mapPoints.length === 0 && (
          <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 text-center">
            <p className="text-[var(--tw-text)] opacity-70">
              No locations found. Add sights to your trip to see them on the
              map.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

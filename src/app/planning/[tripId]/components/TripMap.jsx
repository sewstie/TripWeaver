"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function TripMap({
  mapPoints,
  trip,
  selectedDay,
  onDayChange,
  availableDays,
}) {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);

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
  }, []);

  // Filter points based on selected day
  const filteredMapPoints =
    selectedDay === "all"
      ? mapPoints
      : mapPoints.filter((point) => point.day === selectedDay);

  const getMapCenter = () => {
    if (trip?.locationDetails?.geometry) {
      return [
        trip.locationDetails.geometry.lat,
        trip.locationDetails.geometry.lng,
      ];
    }

    if (filteredMapPoints.length > 0) {
      return [
        filteredMapPoints[0].coordinates.lat,
        filteredMapPoints[0].coordinates.lng,
      ];
    }

    return [20, 0];
  };

  const getMapZoom = () => {
    if (trip?.locationDetails?.geometry) {
      return 12;
    }

    if (filteredMapPoints.length > 0) {
      return 12;
    }

    return 2;
  };

  const getDayLabel = (day) => {
    if (day === "all") return "All Days";

    const dayObj = availableDays.find((d) => d.dateString === day);
    if (dayObj) {
      return `Day ${dayObj.dayNumber}`;
    }

    return `Day ${day}`;
  };

  if (!isClient || !leafletLoaded) {
    return (
      <div className="space-y-4">
        {/* Day selector placeholder */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[var(--tw-text)]">
            Trip Locations
          </h3>
          <div className="w-32 h-8 bg-[var(--tw-field)] rounded-lg animate-pulse"></div>
        </div>

        <div className="h-96 bg-[var(--tw-field)] rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto mb-4"></div>
            <p className="text-[var(--tw-text)] opacity-70">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  const mapCenter = getMapCenter();
  const mapZoom = getMapZoom();

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-[var(--tw-text)]">
            Trip Locations
          </h3>
          <p className="text-sm text-[var(--tw-text)] opacity-70">
            {filteredMapPoints.length} location
            {filteredMapPoints.length !== 1 ? "s" : ""} shown
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedDay}
            onChange={(e) => onDayChange(e.target.value)}
            className="bg-[var(--tw-field)] border border-[var(--tw-border)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] appearance-none pr-8 min-w-[120px]"
          >
            <option value="all">All Days</option>
            {availableDays.map((day) => (
              <option key={day.dateString} value={day.dateString}>
                Day {day.dayNumber}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--tw-text)] opacity-60 pointer-events-none" />
        </div>
      </div>

      <div className="h-96 w-full rounded-lg overflow-hidden border border-[var(--tw-border)]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
          zoomControl={true}
          key={`${selectedDay}-${filteredMapPoints.length}`} // Force re-render when selection changes
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredMapPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.coordinates.lat, point.coordinates.lng]}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{point.name}</h3>
                  <p className="text-sm mb-2">{point.location}</p>
                  {point.notes && (
                    <p className="text-xs text-gray-600 mb-2">{point.notes}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {getDayLabel(point.day)}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {filteredMapPoints.length === 0 && selectedDay !== "all" && (
        <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 text-center">
          <p className="text-[var(--tw-text)] opacity-70">
            No locations found for {getDayLabel(selectedDay)}. Add sights to
            this day to see them on the map.
          </p>
        </div>
      )}

      {mapPoints.length === 0 && (
        <div className="bg-[var(--tw-subbackground)] rounded-lg p-4 text-center">
          <p className="text-[var(--tw-text)] opacity-70">
            No locations with coordinates found. Add sights to your trip to see
            them on the map.
          </p>
        </div>
      )}
    </div>
  );
}

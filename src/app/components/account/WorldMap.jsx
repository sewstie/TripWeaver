"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

export default function WorldMap({ trips, onTripClick }) {
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

  const formatDate = (date) => {
    if (!date) return "Not set";
    if (date.toDate) {
      return date.toDate().toLocaleDateString();
    }
    return new Date(date).toLocaleDateString();
  };

  const getCoordinatesFromTrip = (trip) => {
    if (
      trip.locationDetails?.geometry?.lat &&
      trip.locationDetails?.geometry?.lng
    ) {
      return [
        trip.locationDetails.geometry.lat,
        trip.locationDetails.geometry.lng,
      ];
    }
    return null;
  };

  if (!isClient || !leafletLoaded) {
    return (
      <div className="h-96 bg-[var(--tw-field)] rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)] mx-auto mb-4"></div>
          <p className="text-[var(--tw-text)] opacity-70">Loading map...</p>
        </div>
      </div>
    );
  }

  const validTrips = trips.filter((trip) => {
    const coords = getCoordinatesFromTrip(trip);
    return coords !== null;
  });

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-[var(--tw-border)]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validTrips.map((trip) => {
          const coordinates = getCoordinatesFromTrip(trip);
          return (
            <Marker
              key={trip.id}
              position={coordinates}
              eventHandlers={{
                click: () => {},
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-lg mb-2">{trip.name}</h3>
                  <p className="text-sm mb-2">{trip.destination}</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Start: {formatDate(trip.startDate)}</p>
                    <p>End: {formatDate(trip.endDate)}</p>
                  </div>
                  {onTripClick && (
                    <button
                      onClick={(e) => {
                        onTripClick(trip);
                      }}
                      className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                    >
                      View Trip
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";

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

    try {
      if (date.toDate) {
        date = date.toDate();
      }

      if (typeof date === "string") {
        date = new Date(date);
      }

      return format(date, "d MMMM");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  const getCoordinatesFromTrip = (trip) => {
    if (trip.type === "advanced" && trip.arrivalCity?.geometry) {
      return [trip.arrivalCity.geometry.lat, trip.arrivalCity.geometry.lng];
    }

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

  const getDisplayName = (trip) => {
    if (trip.type === "advanced") {
      return (
        trip.arrivalCity?.components?.city ||
        trip.arrivalCity?.components?.town ||
        trip.arrivalCity?.components?.village ||
        trip.arrivalCity?.formatted?.split(",")[0] ||
        trip.name
      );
    }

    return trip.destination || trip.name;
  };

  const getDisplayLocation = (trip) => {
    if (trip.type === "advanced") {
      return trip.arrivalCity?.formatted || "Advanced Trip";
    }

    return trip.destination || "Trip Location";
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
                  <h3 className="font-bold text-lg">{trip.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getDisplayLocation(trip)}
                  </p>
                  <div className="text-sm">
                    <p>
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>
                  {onTripClick && (
                    <button
                      onClick={(e) => {
                        onTripClick(trip);
                      }}
                      className="cursor-pointer rounded bg-[var(--tw-focus)] text-white px-3 py-1 w-full transition-colors"
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

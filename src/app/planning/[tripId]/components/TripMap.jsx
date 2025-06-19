"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function TripMap({ mapPoints = [], trip }) {
  const getMapCenter = () => {
    if (mapPoints.length > 0) {
      return [mapPoints[0].coordinates.lat, mapPoints[0].coordinates.lng];
    }

    if (trip?.locationDetails?.geometry) {
      return [
        trip.locationDetails.geometry.lat,
        trip.locationDetails.geometry.lng,
      ];
    }

    return [52.2297, 21.0122];
  };

  const center = getMapCenter();
  const zoom = mapPoints.length > 0 ? 13 : 11;

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[var(--tw-subbackground)] rounded-lg overflow-hidden">
      <div className="h-96 w-full">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          className="rounded-lg"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {mapPoints.map((point) => (
            <Marker
              key={point.id}
              position={[point.coordinates.lat, point.coordinates.lng]}
            >
              <Popup>
                <div className="text-center min-w-[200px]">
                  <h3 className="font-bold text-base mb-1">{point.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{point.location}</p>
                  {point.day && (
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      {formatDate(point.day)}
                    </p>
                  )}
                  {point.notes && (
                    <p className="text-xs text-gray-500 mt-2 border-t pt-2">
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
  );
}

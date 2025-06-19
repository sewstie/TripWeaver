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

export default function TripMap({ mapPoints = [] }) {
  const center =
    mapPoints.length > 0
      ? [mapPoints[0].coordinates.lat, mapPoints[0].coordinates.lng]
      : [52.2297, 21.0122];
  const zoom = 13;

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
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{point.name}</h3>
                  <p className="text-xs text-gray-600">{point.location}</p>
                  {point.notes && (
                    <p className="text-xs text-gray-500 mt-1">{point.notes}</p>
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

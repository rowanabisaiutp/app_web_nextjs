"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [19.4326, -99.1332]; // Ciudad de México

export type BusinessPin = {
  id: number;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
};

type Props = {
  businesses: BusinessPin[];
};

export default function BusinessesMap({ businesses }: Props) {
  const center: [number, number] =
    businesses.length > 0 ? [businesses[0].lat, businesses[0].lng] : DEFAULT_CENTER;
  const zoom = businesses.length > 0 ? 12 : 5;

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600">
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {businesses.map((b) => (
          <Marker key={b.id} position={[b.lat, b.lng]}>
            <Popup>
              <strong>{b.name}</strong>
              {b.address && (
                <>
                  <br />
                  {b.address}
                </>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

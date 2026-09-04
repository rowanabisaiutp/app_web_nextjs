"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = { address: string };

type Status = "loading" | "found" | "not-found" | "error";

export default function DeliveryMap({ address }: Props) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const geocode = useCallback(async (addr: string, cancelledRef: { current: boolean }) => {
    setStatus("loading");
    setCoords(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addr)}`
      );
      if (!res.ok) throw new Error("geocode failed");
      const data = await res.json();
      if (cancelledRef.current) return;
      const hit = data?.[0];
      if (hit) {
        setCoords([parseFloat(hit.lat), parseFloat(hit.lon)]);
        setStatus("found");
      } else {
        setStatus("not-found");
      }
    } catch {
      if (!cancelledRef.current) setStatus("error");
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { current: false };
    geocode(address, cancelledRef);
    return () => {
      cancelledRef.current = true;
    };
  }, [address, geocode]);

  if (status === "loading") {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Buscando ubicación…</p>;
  }

  if (status !== "found" || !coords) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        No se pudo ubicar la dirección en el mapa.
      </p>
    );
  }

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-600">
      <MapContainer center={coords} zoom={16} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{address}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

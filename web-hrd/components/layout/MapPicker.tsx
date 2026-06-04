"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Crosshair, Loader2 } from "lucide-react";

// Fix for leaflet default icon issue in Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onChange: (lat: number, lng: number) => void;
}

// Komponen untuk fly ke posisi baru saat koordinat berubah dari luar (tombol lokasi sekarang)
function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], 17);
  }, [lat, lng]);
  return null;
}

function LocationMarker({ lat, lng, radius, onChange }: MapPickerProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return (
    <>
      <Marker position={[lat, lng]} />
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.15 }}
      />
    </>
  );
}

export default function MapPicker({ lat, lng, radius, onChange }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Browser tidak mendukung geolocation");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        onChange(latitude, longitude);
        setFlyTarget({ lat: latitude, lng: longitude });
        setLocating(false);
      },
      (err) => {
        setGeoError("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (!isMounted) return <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg" />;

  return (
    <div className="space-y-2">
      {/* Tombol lokasi sekarang */}
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={locating}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {locating ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Crosshair size={15} />
        )}
        {locating ? "Mendapatkan lokasi..." : "Gunakan Lokasi Saat Ini"}
      </button>

      {/* Error message */}
      {geoError && (
        <p className="text-xs text-red-500">{geoError}</p>
      )}

      {/* Map */}
      <div className="h-[300px] w-full rounded-lg overflow-hidden border">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker lat={lat} lng={lng} radius={radius} onChange={onChange} />
          {flyTarget && <FlyToLocation lat={flyTarget.lat} lng={flyTarget.lng} />}
        </MapContainer>
      </div>

      <p className="text-xs text-gray-400">
        Klik di peta untuk memindahkan pin, atau gunakan tombol di atas untuk lokasi otomatis.
      </p>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useIsMounted } from "@/lib/useStorage";
import { MapPin, AlertCircle, Compass } from "lucide-react";

interface MarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  price?: number;
}

interface LeafletMapProps {
  markers?: MarkerItem[];
  center?: [number, number];
  zoom?: number;
  routePolyline?: [number, number][];
  height?: string;
  fallbackAddress?: string;
}

export function LeafletMap({
  markers = [],
  center = [9.010, 38.760], // Addis Ababa city center
  zoom = 12,
  routePolyline,
  height = "380px",
  fallbackAddress = "Addis Ababa, Ethiopia",
}: LeafletMapProps) {
  const isMounted = useIsMounted();
  const [mapComponent, setMapComponent] = useState<React.ReactNode | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadMap() {
      try {
        const L = (await import("leaflet")).default;
        const { MapContainer, TileLayer, Marker, Popup, Polyline } = await import("react-leaflet");

        // Custom clean SVG pin icon
        const customIcon = L.divIcon({
          className: "custom-leaflet-pin",
          html: `<div style="background-color: #059669; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        if (!active) return;

        setMapComponent(
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%", borderRadius: "1rem" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {markers.map((m) => (
              <Marker key={m.id} position={[m.lat, m.lng]} icon={customIcon}>
                <Popup>
                  <div className="p-1 text-slate-900 font-sans">
                    <p className="font-bold text-xs">{m.title}</p>
                    {m.subtitle && <p className="text-[11px] text-slate-600">{m.subtitle}</p>}
                    {m.price && (
                      <p className="text-xs font-bold text-emerald-600 mt-1">
                        {m.price.toLocaleString()} ETB/day
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {routePolyline && routePolyline.length > 0 && (
              <Polyline
                positions={routePolyline}
                pathOptions={{ color: "#059669", weight: 4, dashArray: "6, 8" }}
              />
            )}
          </MapContainer>
        );
      } catch (err) {
        console.warn("[SheggarWheels] Leaflet map loading fallback:", err);
        if (active) setLoadError(true);
      }
    }

    if (isMounted) {
      loadMap();
    }

    return () => {
      active = false;
    };
  }, [isMounted, center, zoom, markers, routePolyline]);

  if (!isMounted || !mapComponent || loadError) {
    return (
      <div
        style={{ height }}
        className="w-full bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-600 relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 text-sm mb-1">Addis Ababa Location Map</h4>
        <p className="text-xs text-slate-500 max-w-sm mb-3">
          {fallbackAddress} (Approx. Coordinates: {center[0].toFixed(4)}° N, {center[1].toFixed(4)}° E)
        </p>
        <span className="text-[11px] text-slate-400 bg-white px-2.5 py-1 rounded-md border border-slate-200">
          Interactive map container will initialize client-side
        </span>
      </div>
    );
  }

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      {mapComponent}
    </div>
  );
}

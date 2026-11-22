"use client";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { homeIcon, riderIcon } from "./icons";

function FitBounds({ points, follow }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat.toFixed(3)},${p.lng.toFixed(3)}`).join("|");
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView([points[0].lat, points[0].lng], 15);
    else map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng])), { padding: [40, 40], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  useEffect(() => {
    if (follow) map.panTo([follow.lat, follow.lng], { animate: true });
  }, [follow, map]);
  return null;
}

// Shows the delivery address and the rider's live position with a line between them.
export default function TrackingMap({ destination, rider, trail = [], followRider = false }) {
  const points = [destination, rider].filter(Boolean);
  const center = points[0] || { lat: 12.9716, lng: 77.5946 };
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={14} scrollWheelZoom
      className="h-80 w-full rounded-xl border border-slate-200 sm:h-[26rem]" style={{ zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds points={points} follow={followRider ? rider : null} />
      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={homeIcon}>
          <Tooltip direction="top" offset={[0, -36]}>Delivery address</Tooltip>
        </Marker>
      )}
      {trail.length > 1 && <Polyline positions={trail.map((p) => [p.lat, p.lng])} pathOptions={{ color: "#16a34a", weight: 4, opacity: 0.6 }} />}
      {rider && (
        <Marker position={[rider.lat, rider.lng]} icon={riderIcon}>
          <Tooltip direction="top" offset={[0, -36]}>Delivery partner</Tooltip>
        </Marker>
      )}
      {rider && destination && (
        <Polyline positions={[[rider.lat, rider.lng], [destination.lat, destination.lng]]}
          pathOptions={{ color: "#4f46e5", weight: 3, dashArray: "6 8" }} />
      )}
    </MapContainer>
  );
}

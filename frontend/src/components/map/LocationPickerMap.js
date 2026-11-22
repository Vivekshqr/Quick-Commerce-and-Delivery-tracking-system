"use client";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { homeIcon } from "./icons";

function ClickHandler({ onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], Math.max(map.getZoom(), 15));
  }, [position, map]);
  return null;
}

// Click the map or drag the pin to choose a point.
export default function LocationPickerMap({ position, onPick, center }) {
  const start = position || center;
  return (
    <MapContainer center={[start.lat, start.lng]} zoom={position ? 15 : 12} scrollWheelZoom
      className="h-72 w-full rounded-lg border border-slate-300 sm:h-80" style={{ zIndex: 0 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <ClickHandler onPick={onPick} />
      <Recenter position={position} />
      {position && (
        <Marker position={[position.lat, position.lng]} icon={homeIcon} draggable
          eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onPick({ lat: p.lat, lng: p.lng }); } }} />
      )}
    </MapContainer>
  );
}

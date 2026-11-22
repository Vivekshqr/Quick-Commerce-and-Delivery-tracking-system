// Distance in km between two {lat,lng} points (haversine).
export function distanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Simple ETA: road distance ≈ 1.3 × straight line, average city speed 20 km/h.
export function etaMinutes(km, speedKmh = 20) {
  if (km == null) return null;
  return Math.max(1, Math.round(((km * 1.3) / speedKmh) * 60));
}

export const formatKm = (km) => (km == null ? "—" : km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

// Points from start to end with a gentle curve, for the "simulate route" test mode.
export function simulatedRoute(start, end, steps = 40) {
  const pts = [];
  const offLat = (end.lng - start.lng) * 0.15;
  const offLng = -(end.lat - start.lat) * 0.15;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const bend = Math.sin(Math.PI * t);
    pts.push({
      lat: start.lat + (end.lat - start.lat) * t + offLat * bend,
      lng: start.lng + (end.lng - start.lng) * t + offLng * bend,
    });
  }
  return pts;
}

// A start point roughly `km` away from a destination (used when there's no real GPS fix).
export function pointNear(dest, km = 3) {
  const dLat = km / 111;
  return { lat: dest.lat + dLat * 0.7, lng: dest.lng - (dLat * 0.7) / Math.cos((dest.lat * Math.PI) / 180) };
}

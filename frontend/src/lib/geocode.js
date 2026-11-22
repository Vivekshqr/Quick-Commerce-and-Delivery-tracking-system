// Free geocoding with OpenStreetMap Nominatim (no API key). Keep requests light.
const BASE = "https://nominatim.openstreetmap.org";

export async function searchPlaces(query) {
  const r = await fetch(`${BASE}/search?format=json&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`, {
    headers: { "Accept-Language": "en" },
  });
  if (!r.ok) throw new Error("Search failed");
  const data = await r.json();
  return data.map((d) => ({ label: d.display_name, lat: Number(d.lat), lng: Number(d.lon) }));
}

export async function reverseGeocode({ lat, lng }) {
  try {
    const r = await fetch(`${BASE}/reverse?format=json&zoom=18&lat=${lat}&lon=${lng}`, {
      headers: { "Accept-Language": "en" },
    });
    if (!r.ok) return "";
    return (await r.json()).display_name || "";
  } catch {
    return "";
  }
}

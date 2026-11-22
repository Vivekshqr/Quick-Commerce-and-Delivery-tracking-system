import L from "leaflet";

// Simple CSS pins (no external marker images needed).
const pin = (color, emoji) =>
  L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">
      <div style="background:${color};color:#fff;width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.35);border:2px solid #fff">
        <span style="transform:rotate(45deg);font-size:16px">${emoji}</span></div></div>`,
    iconSize: [0, 0],
  });

export const homeIcon = pin("#4f46e5", "🏠");
export const riderIcon = pin("#16a34a", "🛵");
export const storeIcon = pin("#d97706", "🏪");

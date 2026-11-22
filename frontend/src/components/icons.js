// Small inline SVG icon set (stroke icons, 24x24), so no icon library is needed.
const base = (paths, { className = "h-5 w-5", strokeWidth = 2 } = {}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths}</svg>
);

export const BoltIcon = (p) => base(<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />, p);
export const CartIcon = (p) => base(<><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" /><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6" /></>, p);
export const BellIcon = (p) => base(<><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>, p);
export const SunIcon = (p) => base(<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>, p);
export const MoonIcon = (p) => base(<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />, p);
export const MenuIcon = (p) => base(<path d="M4 6h16M4 12h16M4 18h16" />, p);
export const CloseIcon = (p) => base(<path d="M6 6l12 12M18 6 6 18" />, p);
export const SearchIcon = (p) => base(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>, p);
export const MapPinIcon = (p) => base(<><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></>, p);
export const TruckIcon = (p) => base(<><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></>, p);
export const ClockIcon = (p) => base(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>, p);
export const ShieldIcon = (p) => base(<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" /><path d="m9 12 2 2 4-4" /></>, p);
export const LogoutIcon = (p) => base(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 17l-5-5 5-5M5 12h11" /></>, p);
export const BoxIcon = (p) => base(<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>, p);
export const HistoryIcon = (p) => base(<><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></>, p);
export const HomeIcon = (p) => base(<><path d="m3 11 9-7 9 7" /><path d="M5 10v10h14V10" /></>, p);
export const ChartIcon = (p) => base(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>, p);
export const UsersIcon = (p) => base(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" /></>, p);
export const TagIcon = (p) => base(<><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" /><circle cx="7.5" cy="7.5" r="1.5" /></>, p);
export const ArrowRightIcon = (p) => base(<path d="M5 12h14M13 6l6 6-6 6" />, p);
export const CheckIcon = (p) => base(<path d="m5 12 5 5L20 7" />, p);
export const StarIcon = (p) => base(<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />, p);
export const WalletIcon = (p) => base(<><path d="M3 7a2 2 0 0 1 2-2h13v4" /><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z" /><circle cx="16" cy="14.5" r="1.2" /></>, p);

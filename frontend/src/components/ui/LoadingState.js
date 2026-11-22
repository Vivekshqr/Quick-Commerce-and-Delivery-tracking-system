import { CardSkeleton } from "./Skeleton";

// Skeleton cards while loading (label kept for screen readers).
export default function LoadingState({ label = "Loading…", rows = 2 }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 py-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

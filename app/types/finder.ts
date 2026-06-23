// Domain model for the Real-Time Finder map.
//
// Everything the map, the "Available near you" list, and the floating cards
// render comes from a single `FinderSnapshot`. A `FinderSource` produces these
// snapshots over time. Today the only source is the mock (see
// app/lib/finder/mockFinderSource.ts); when real contractor GPS data exists, a
// `realtimeFinderSource` emits the same shape and nothing downstream changes.

export type LatLng = { lat: number; lng: number };

export type ProStatus = 'available' | 'finishing' | 'en_route';

export type ProPresence = {
  id: string;
  name: string;
  initials: string;
  trade: string;
  rating: string;
  status: ProStatus;
  /** Human-readable status pill, e.g. "Available now" or "Finishing job · 35 min". */
  statusLabel: string;
  /** Right-hand list meta line, e.g. "0.8 mi · 12 min ETA". */
  meta: string;
  /** Current map position. For en_route pros this advances along `routePath`. */
  position: LatLng;
  etaMinutes: number;
  distanceMiles: number;
  /** The home this pro is currently driving to (only for en_route). */
  destination?: LatLng;
  /** Road-following path from pro → destination. Straight line until resolved. */
  routePath?: LatLng[];
  /** 0..1 progress of the pro along `routePath`. */
  progress?: number;
};

export type FinderSnapshot = {
  /** Map center — the searched area / "YOU" home marker. */
  center: LatLng;
  pros: ProPresence[];
  jobsInProgress: number;
};

/**
 * A source of finder snapshots. `subscribe` immediately invokes the listener
 * with the current snapshot, then again on every update; it returns an
 * unsubscribe function. This is the seam the live transport plugs into later.
 */
export type FinderSource = {
  subscribe: (listener: (snapshot: FinderSnapshot) => void) => () => void;
};

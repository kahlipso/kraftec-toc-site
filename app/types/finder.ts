// Domain model for the Real-Time Finder map.
//
// Everything the map, the "Available near you" list, and the floating cards
// render comes from a single `FinderSnapshot`, built server-side from the
// `pros` table by `getFinderSnapshot()` in app/lib/pros.ts. Distance and ETA
// are NOT part of this model: they depend on the address the visitor searched,
// so FinderExperience derives them per render.

export type LatLng = { lat: number; lng: number };

export type ProStatus = 'idle' | 'working' | 'finishing';

export type ProPresence = {
  id: string;
  name: string;
  initials: string;
  trade: string;
  rating: string;
  status: ProStatus;
  /** Human-readable status pill, e.g. "Available now" or "Finishing job". */
  statusLabel: string;
  /** This pro's base location (pros.lat/lng) — the center of their coverage circle. */
  position: LatLng;
  /** Radius (miles) this pro serves around `position` (pros.service_radius_miles). */
  radiusMiles: number;
};

export type FinderSnapshot = {
  /**
   * Where the map opens: the home market, until the visitor's device location
   * or a searched address replaces it client-side.
   */
  center: LatLng;
  /**
   * City named in the hero headline on the server — the one `center` sits in.
   * Once Maps loads, the client replaces it with the city Google itself labels
   * the map center, so headline and map never disagree.
   */
  centerCity: string;
  pros: ProPresence[];
};

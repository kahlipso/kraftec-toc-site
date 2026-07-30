import { getSql } from './db';
import { haversineMiles } from './finder/geo';
import type { FinderSnapshot, LatLng, ProPresence, ProStatus } from '@/app/types/finder';
import type { ProProfile } from '@/app/types/pro';

// Pros now live in Postgres (table: pros). Same seam pattern as work-orders.ts:
// pages call these getters and never touch SQL or row shapes directly.

function rowToProProfile(row: Record<string, unknown>): ProProfile {
  return {
    id: row.id as string,
    initials: row.initials as string,
    name: row.name as string,
    type: row.type as string,
    location: row.location as string,
    yearsOperating: row.years_operating as number,
    lat: row.lat as number,
    lng: row.lng as number,
    serviceRadiusMiles: row.service_radius_miles as number,
    status: row.status as ProProfile['status'],
    trades: row.trades as string[],
    contactName: row.contact_name as string,
    note: row.note as string,
    rating: row.rating as number,
    verifiedJobs: row.verified_jobs as number,
    tags: row.tags as string[],
    outcomeScore: row.outcome_score as number,
    verification: row.verification as ProProfile['verification'],
    performance: row.performance as ProProfile['performance'],
    reviews: row.reviews as ProProfile['reviews'],
  };
}

function isMissingArchivedColumn(error: unknown) {
  return typeof error === 'object' && error !== null &&
    String((error as { message?: unknown }).message).includes('archived_at');
}

/** A single pro profile by id, or undefined if it doesn't exist. */
export async function getPro(id: string): Promise<ProProfile | undefined> {
  const sql = getSql();
  let rows;
  try {
    rows = await sql`SELECT * FROM pros WHERE id = ${id} AND archived_at IS NULL`;
  } catch (error) {
    if (!isMissingArchivedColumn(error)) throw error;
    rows = await sql`SELECT * FROM pros WHERE id = ${id}`;
  }
  return rows[0] ? rowToProProfile(rows[0]) : undefined;
}

export type ProMatch = { pro: ProProfile; distanceMiles: number };

/**
 * The matcher: closest pro serving the given trade, measured from the
 * searched location. Returns null when no pro serves that trade.
 */
export async function matchPro(
  tradeSlug: string,
  lat: number,
  lng: number,
): Promise<ProMatch | null> {
  const sql = getSql();
  // jsonb containment: does the trades array contain this slug?
  let rows;
  try {
    rows = await sql`
      SELECT * FROM pros
      WHERE trades @> ${JSON.stringify([tradeSlug])}::jsonb AND archived_at IS NULL
    `;
  } catch (error) {
    if (!isMissingArchivedColumn(error)) throw error;
    rows = await sql`SELECT * FROM pros WHERE trades @> ${JSON.stringify([tradeSlug])}::jsonb`;
  }
  if (rows.length === 0) return null;

  // Rank candidates by real distance to the searched point, then drop anyone
  // whose coverage radius doesn't actually reach that point.
  const ranked = rows
    .map((row) => {
      const pro = rowToProProfile(row);
      return { pro, distanceMiles: haversineMiles({ lat, lng }, { lat: pro.lat, lng: pro.lng }) };
    })
    .filter((candidate) => candidate.distanceMiles <= candidate.pro.serviceRadiusMiles)
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return ranked[0] ?? null;
}

// --- Real-Time Finder map (homepage) ---

/**
 * Where the map opens before anything is known about the visitor. This is the
 * home market, not a derived value: the client overrides it as soon as the
 * visitor shares their device location or searches an address.
 */
export const DEFAULT_FINDER_CENTER: LatLng = { lat: 41.7947, lng: -88.0128 }; // Downers Grove, IL
const DEFAULT_FINDER_CITY = 'Downers Grove';

const finderStatusLabels: Record<ProStatus, string> = {
  idle: 'Available now',
  working: 'On a job',
  finishing: 'Finishing job',
};

/** "hvac-repair" -> "Hvac Repair". Only a fallback when `type` is blank. */
function prettifyTrade(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function rowToProPresence(row: Record<string, unknown>): ProPresence {
  const status = (row.status as ProStatus) ?? 'idle';
  const trades = (row.trades as string[] | null) ?? [];
  return {
    id: row.id as string,
    name: row.name as string,
    initials: row.initials as string,
    trade: (row.type as string) || (trades[0] ? prettifyTrade(trades[0]) : 'Pro'),
    rating: Number(row.rating ?? 0).toFixed(1),
    status,
    statusLabel: finderStatusLabels[status] ?? finderStatusLabels.idle,
    position: { lat: Number(row.lat), lng: Number(row.lng) },
    radiusMiles: Number(row.service_radius_miles),
  };
}

/**
 * Every non-archived pro, shaped for the homepage map. This is the only source
 * the finder reads — edit a technician's address in /admin/technicians and the
 * next request to `/` shows the new pin (the homepage is `force-dynamic`).
 */
export async function getFinderSnapshot(): Promise<FinderSnapshot> {
  const sql = getSql();
  let rows;
  try {
    rows = await sql`SELECT * FROM pros WHERE archived_at IS NULL ORDER BY name`;
  } catch (error) {
    if (!isMissingArchivedColumn(error)) throw error;
    rows = await sql`SELECT * FROM pros ORDER BY name`;
  }

  // A pro with no coordinates can't be placed on a map; drop rather than
  // render them at (0, 0) off the coast of Africa.
  const placed = rows.filter(
    (row) => Number.isFinite(Number(row.lat)) && Number.isFinite(Number(row.lng)),
  );
  const pros = placed.map(rowToProPresence);

  // The center is deliberately NOT derived from the roster: the map opens on
  // the home market and only moves for the visitor (device location or a
  // searched address), so the starting view is the same for everyone.
  return { center: DEFAULT_FINDER_CENTER, centerCity: DEFAULT_FINDER_CITY, pros };
}

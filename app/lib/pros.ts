import { getSql } from './db';
import { haversineMiles } from './finder/geo';
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

/** A single pro profile by id, or undefined if it doesn't exist. */
export async function getPro(id: string): Promise<ProProfile | undefined> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM pros WHERE id = ${id}`;
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
  const rows = await sql`
    SELECT * FROM pros
    WHERE trades @> ${JSON.stringify([tradeSlug])}::jsonb
  `;
  if (rows.length === 0) return null;

  // Rank candidates by real distance to the searched point.
  const ranked = rows
    .map((row) => {
      const pro = rowToProProfile(row);
      return { pro, distanceMiles: haversineMiles({ lat, lng }, { lat: pro.lat, lng: pro.lng }) };
    })
    .sort((a, b) => a.distanceMiles - b.distanceMiles);

  return ranked[0];
}
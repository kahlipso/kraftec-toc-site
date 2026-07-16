'use server';

import { matchPro, type ProMatch } from '@/app/lib/pros';
import { isTrade } from '@/app/lib/trades';

// Server Action: the browser calls this like a normal async function, but the
// body runs on the server (where the DB lives). Next handles the wiring.
export async function findMatch(
  tradeSlug: string,
  lat: number,
  lng: number,
): Promise<ProMatch | null> {
  // Never trust client input: validate before touching the database.
  if (!isTrade(tradeSlug) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return matchPro(tradeSlug, lat, lng);
}
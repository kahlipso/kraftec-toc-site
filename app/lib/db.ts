import { neon } from '@neondatabase/serverless';

// Returns a Neon SQL client, created lazily *on first use* — not when this module
// is imported. This matters for the build: importing a file that needs the DB must
// never crash just because DATABASE_URL isn't set in that environment (e.g. during
// `next build`). The client is only created when a query actually runs (at request
// time), where DATABASE_URL is available.
export function getSql() {
  // Local `.env.local` uses DATABASE_URL; on Vercel the Neon integration named it
  // with a KRA_ prefix (KRA_DATABASE_URL). Accept either so both environments work.
  const url = process.env.DATABASE_URL ?? process.env.KRA_DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL (or KRA_DATABASE_URL) is not set');
  }
  return neon(url);
}

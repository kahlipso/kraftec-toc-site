import { Pool } from 'pg';

// The partner company's AWS RDS Postgres, holding their real work-order and
// technician data. This is a SECOND database, separate from our own Neon one
// (see `db.ts`) — Neon still owns everything the site writes: bookings, sessions,
// benchmarks, admin edits.
//
// Why a different client: `@neondatabase/serverless` doesn't speak the Postgres
// wire protocol at all. It posts SQL to Neon's own HTTPS endpoint, so it can only
// ever reach a Neon database. Talking to RDS means a real TCP connection, which
// is what `pg` gives us.
//
// This connection is READ-ONLY, and deliberately so — it's not our data. The
// read-only guarantee is enforced on the server (see `options` below), not just
// by us remembering to only write SELECTs.

// Cached on globalThis so Next's dev hot-reload doesn't leak a new pool on every
// edit, and so a warm serverless instance reuses its connections between requests.
const globalForRds = globalThis as unknown as { rdsPool?: Pool };

function createPool(): Pool {
  // The credentials arrive as separate host/port/user/password/database values, so
  // take them that way. Passwords with @ : / or ? in them silently corrupt a URL
  // unless every one is percent-encoded; discrete vars have no such trap.
  const { RDS_HOST, RDS_PORT, RDS_USER, RDS_PASSWORD, RDS_DATABASE } = process.env;

  const missing = ['RDS_HOST', 'RDS_USER', 'RDS_PASSWORD', 'RDS_DATABASE'].filter(
    (name) => !process.env[name],
  );
  if (missing.length) {
    throw new Error(`RDS connection is not configured — missing ${missing.join(', ')}`);
  }

  return new Pool({
    host: RDS_HOST,
    port: Number(RDS_PORT ?? 5432),
    user: RDS_USER,
    password: RDS_PASSWORD,
    database: RDS_DATABASE,
    // RDS terminates TLS with a certificate signed by Amazon's own CA, which isn't
    // in Node's trust store. `rejectUnauthorized: false` still encrypts the
    // connection but skips verifying who's on the other end. To verify properly,
    // download the AWS RDS global CA bundle and set RDS_CA_CERT to its contents.
    ssl: process.env.RDS_CA_CERT
      ? { ca: process.env.RDS_CA_CERT }
      : { rejectUnauthorized: false },
    // Enforced by Postgres itself: any INSERT/UPDATE/DELETE/DDL on this connection
    // errors out. We cannot accidentally write to the partner's production data.
    options: '-c default_transaction_read_only=on',
    // A serverless function that gets frozen mid-request shouldn't hold connections
    // open against RDS's connection limit indefinitely.
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

/**
 * The shared RDS pool, created lazily on first use — never at import time, so that
 * `next build` can compile files that import this without RDS credentials present.
 */
export function getRdsPool(): Pool {
  globalForRds.rdsPool ??= createPool();
  return globalForRds.rdsPool;
}

/**
 * Tagged-template query, shaped like the `sql` from `db.ts` so RDS reads look the
 * same as Neon reads at the call site:
 *
 *   const rows = await rdsSql`SELECT * FROM work_order WHERE id = ${id}`;
 *
 * Interpolated values become $1, $2, … bind parameters — they are sent to Postgres
 * separately from the SQL text, so a value can never be parsed as SQL.
 */
export async function rdsSql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  // With no seed value, reduce starts at fragment 0 and the first callback runs with
  // i = 1 — which lines the placeholder up exactly: the value sitting between
  // fragment 0 and fragment 1 is $1.
  const text = strings.reduce((query, part, i) => query + '$' + i + part);
  const result = await getRdsPool().query(text, values);
  return result.rows as T[];
}

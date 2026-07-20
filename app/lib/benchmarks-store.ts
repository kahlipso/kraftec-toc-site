import 'server-only';

import { benchmarks, type TradeBenchmark } from './benchmarks';
import { getSql } from './db';

/** Database overrides are optional until the admin migration has been run. */
export async function getBenchmarksForQuote(): Promise<Record<string, TradeBenchmark>> {
  try {
    const sql = getSql();
    const rows = await sql`SELECT trade_slug, config FROM quote_benchmarks`;
    const result = { ...benchmarks };
    for (const row of rows) {
      const slug = row.trade_slug as string;
      if (slug in result && row.config && typeof row.config === 'object') result[slug] = row.config as TradeBenchmark;
    }
    return result;
  } catch {
    // Keep the customer quote checker available until the optional admin
    // benchmark table has been created by the Neon migration.
    return benchmarks;
  }
}

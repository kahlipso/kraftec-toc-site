import { benchmarks, type TradeBenchmark } from './benchmarks';
import { trades } from './trades';
import type { AnalyzedLine, LineFlag, QuoteAnalysis } from '@/app/types/quote';

// The deterministic half of the Check Quote engine. Pure math — no network, no
// AI: keyword-match each line item to a trade benchmark, compute a fair total
// range, and place the quoted total on the gauge.

export type QuoteRowInput = { item: string; qty: string; cost: string };

/** "$1,247.50" → 1247.5; garbage → 0. */
function parseMoney(input: string): number {
  const n = parseFloat(input.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function flagFor(cost: number, high: number): LineFlag {
  if (cost <= high) return 'in_range';
  if (cost <= high * 1.5) return 'high';
  return 'above_market';
}

export function analyzeQuote(
  serviceSlug: string,
  rows: QuoteRowInput[],
  benchmarkSet: Record<string, TradeBenchmark> = benchmarks,
): QuoteAnalysis | null {
  const trade = trades.find((t) => t.slug === serviceSlug);
  const bench = benchmarkSet[serviceSlug];
  if (!trade || !bench) return null;

  // Keep only rows with a name and a positive price.
  const priced = rows
    .map((r) => ({
      item: r.item.trim(),
      qty: Math.max(1, Math.round(parseMoney(r.qty) || 1)),
      cost: parseMoney(r.cost),
    }))
    .filter((r) => r.item && r.cost > 0);
  if (priced.length === 0) return null;

  const lines: AnalyzedLine[] = priced.map((r) => {
    const text = r.item.toLowerCase();
    const match = bench.lineBenchmarks.find((b) => b.match.some((kw) => text.includes(kw)));
    if (!match) return { ...r, flag: 'no_benchmark' };
    // Benchmarks are per-unit; scale by quantity for the comparison.
    const low = match.range[0] * r.qty;
    const high = match.range[1] * r.qty;
    return {
      ...r,
      marketLow: low,
      marketHigh: high,
      benchmarkLabel: match.label,
      flag: flagFor(r.cost, high),
    };
  });

  const total = lines.reduce((sum, l) => sum + l.cost, 0);

  // Fair range: benchmark ranges where we have them, face value where we don't.
  // If nothing matched at all, fall back to the trade's typical visit range.
  const anyMatched = lines.some((l) => l.marketHigh !== undefined);
  let fairLow: number;
  let fairHigh: number;
  if (anyMatched) {
    fairLow = lines.reduce((s, l) => s + (l.marketLow ?? l.cost), 0);
    fairHigh = lines.reduce((s, l) => s + (l.marketHigh ?? l.cost), 0);
  } else {
    [fairLow, fairHigh] = bench.typicalVisitRange;
  }

  const pctAbove = total > fairHigh ? Math.round(((total - fairHigh) / fairHigh) * 100) : 0;
  const verdict = pctAbove === 0 ? 'fair' : pctAbove <= 25 ? 'high' : 'above';

  return {
    tradeName: trade.name,
    total,
    fairLow: Math.round(fairLow),
    fairHigh: Math.round(fairHigh),
    pctAbove,
    verdict,
    lines,
    basedOn: `Based on Kraftec price benchmarks for ${trade.name} and verified jobs on our platform.`,
  };
}

// Check Quote domain: what the analysis engine computes and the result UI renders.

export type LineFlag = 'in_range' | 'high' | 'above_market' | 'no_benchmark';

export type AnalyzedLine = {
  item: string;
  qty: number;
  cost: number;
  /** Benchmark range for this line, when a benchmark matched. */
  marketLow?: number;
  marketHigh?: number;
  /** Label of the matched benchmark, e.g. "Diagnostic / trip fee". */
  benchmarkLabel?: string;
  flag: LineFlag;
};

export type QuoteVerdict = 'fair' | 'high' | 'above';

export type QuoteQuestion = {
  question: string;
  why: string;
};

export type QuoteAnalysis = {
  tradeName: string;
  total: number;
  fairLow: number;
  fairHigh: number;
  /** Percent above the fair-range high; 0 when within range. */
  pctAbove: number;
  verdict: QuoteVerdict;
  lines: AnalyzedLine[];
  /** Honest source line, e.g. "Kraftec price benchmarks for HVAC · verified jobs on our platform". */
  basedOn: string;
};

export type QuoteCheckResult =
  | (QuoteAnalysis & { ok: true; questions: QuoteQuestion[]; aiGenerated: boolean })
  | { ok: false; error: 'invalid_service' | 'no_priced_lines' };

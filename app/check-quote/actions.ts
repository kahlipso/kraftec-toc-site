'use server';

import Anthropic from '@anthropic-ai/sdk';
import { analyzeQuote, type QuoteRowInput } from '@/app/lib/quote-analysis';
import { getBenchmarksForQuote } from '@/app/lib/benchmarks-store';
import { isTrade } from '@/app/lib/trades';
import type { QuoteAnalysis, QuoteCheckResult, QuoteQuestion } from '@/app/types/quote';

// Server Action for the Check Quote form. The verdict math is deterministic
// (analyzeQuote); Claude writes only the tailored "questions to ask". Without an
// ANTHROPIC_API_KEY — or on any API failure — the trade's canned questions are
// used instead, so the result always renders (same seam pattern as Maps/Twilio).

const questionsSchema = {
  type: 'object' as const,
  properties: {
    questions: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          question: { type: 'string' as const, description: 'A short, word-for-word question the homeowner can ask the contractor, in quotes.' },
          why: { type: 'string' as const, description: 'One sentence on why this question helps.' },
        },
        required: ['question', 'why'],
        additionalProperties: false,
      },
    },
  },
  required: ['questions'],
  additionalProperties: false,
};

async function generateQuestions(
  analysis: QuoteAnalysis,
  notes: string,
): Promise<QuoteQuestion[] | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 1 });

    const linesSummary = analysis.lines
      .map((l) => {
        const market =
          l.marketHigh !== undefined ? `market $${l.marketLow}–$${l.marketHigh}` : 'no benchmark';
        return `- "${l.item}" ×${l.qty}: quoted $${l.cost} (${market}, flag: ${l.flag})`;
      })
      .join('\n');

    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2000,
      output_config: { format: { type: 'json_schema', schema: questionsSchema } },
      system:
        'You help homeowners evaluate home-service quotes. Write exactly 3 short questions the homeowner can ask the contractor word-for-word — reasonable and non-confrontational, each targeting a specific concern in THIS quote (flagged line items first). Each question is wrapped in double quotes. Each "why" is one plain-English sentence on what asking it accomplishes. Never invent prices or facts not present in the data.',
      messages: [
        {
          role: 'user',
          content:
            `Trade: ${analysis.tradeName}\n` +
            `Quoted total: $${analysis.total} (fair range $${analysis.fairLow}–$${analysis.fairHigh}, ${analysis.pctAbove}% above)\n` +
            `Line items:\n${linesSummary}\n` +
            (notes.trim() ? `Homeowner's notes: ${notes.trim()}\n` : '') +
            `\nWrite the 3 questions.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return null;
    const parsed = JSON.parse(textBlock.text) as { questions: QuoteQuestion[] };
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) return null;
    return parsed.questions.slice(0, 3);
  } catch (err) {
    console.error('[check-quote] AI questions failed, using canned:', err);
    return null;
  }
}

export async function checkQuote(input: {
  service: string;
  rows: QuoteRowInput[];
  notes: string;
}): Promise<QuoteCheckResult> {
  if (!isTrade(input.service)) return { ok: false, error: 'invalid_service' };

  const benchmarkSet = await getBenchmarksForQuote();
  const analysis = analyzeQuote(input.service, input.rows, benchmarkSet);
  if (!analysis) return { ok: false, error: 'no_priced_lines' };

  const aiQuestions = await generateQuestions(analysis, input.notes);
  const questions = aiQuestions ?? benchmarkSet[input.service].cannedQuestions;

  return { ...analysis, ok: true, questions, aiGenerated: aiQuestions !== null };
}

import type { QuoteQuestion } from '@/app/types/quote';

// Editorial price benchmarks per trade — the deterministic half of the Check
// Quote engine (same spirit as the Know the Price cards). Line items are
// keyword-matched against `lineBenchmarks`; unmatched quotes fall back to the
// trade's `typicalVisitRange`. `cannedQuestions` are the no-AI fallback for the
// "questions to ask" card. Swapping in real aggregates later only touches this file.

export type LineBenchmark = {
  /** Lowercase keywords; a line item matches if it contains any of them. */
  match: string[];
  label: string;
  range: [number, number];
};

export type TradeBenchmark = {
  typicalVisitRange: [number, number];
  lineBenchmarks: LineBenchmark[];
  cannedQuestions: QuoteQuestion[];
};

export const benchmarks: Record<string, TradeBenchmark> = {
  hvac: {
    typicalVisitRange: [129, 485],
    lineBenchmarks: [
      { match: ['diagnostic', 'diagnosis', 'trip', 'service fee', 'service call'], label: 'Diagnostic / trip fee', range: [85, 150] },
      { match: ['capacitor'], label: 'Run capacitor (part + install)', range: [90, 180] },
      { match: ['contactor'], label: 'Contactor replacement', range: [140, 240] },
      { match: ['refrigerant', 'freon', 'top-off', 'top off', 'recharge'], label: 'Refrigerant per lb', range: [70, 120] },
      { match: ['labor', 'hour', '/hr', 'hr rate', 'hourly'], label: 'Labor per hour', range: [135, 185] },
      { match: ['thermostat'], label: 'Thermostat replacement', range: [150, 350] },
      { match: ['inspection', 'tune-up', 'tune up', 'maintenance'], label: 'Inspection / tune-up', range: [80, 160] },
    ],
    cannedQuestions: [
      { question: '"Was this billed as an emergency call? If it was a scheduled appointment, can you bill the labor at your standard rate?"', why: 'Emergency/after-hours surcharges are often applied by default — most contractors remove them when asked directly.' },
      { question: '"Can you break out the part cost vs. labor on this line? What does the part itself retail for?"', why: 'A fair contractor can explain their markup; 4–6× on common parts is industry-typical, beyond that deserves an explanation.' },
      { question: '"If the system needed refrigerant, where is the leak? Can you do a leak search before topping it off?"', why: 'Topping off a leaking system is temporary — you will pay again in months, which is sometimes the point.' },
    ],
  },
  plumbing: {
    typicalVisitRange: [89, 350],
    lineBenchmarks: [
      { match: ['diagnostic', 'trip', 'service fee', 'service call'], label: 'Diagnostic / trip fee', range: [60, 120] },
      { match: ['faucet'], label: 'Faucet repair / replacement', range: [90, 250] },
      { match: ['drain', 'snake', 'clog', 'auger'], label: 'Drain clearing', range: [100, 275] },
      { match: ['water heater'], label: 'Water heater work', range: [150, 600] },
      { match: ['toilet'], label: 'Toilet repair / install', range: [90, 350] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [90, 160] },
      { match: ['valve', 'shutoff', 'shut-off'], label: 'Valve replacement', range: [90, 220] },
    ],
    cannedQuestions: [
      { question: '"Is this priced flat-rate or by the hour? Can I see how much of it is labor?"', why: 'Flat-rate books sometimes assume worst-case time — asking for the split reveals padding.' },
      { question: '"Does this include the parts, and what do they retail for?"', why: 'Standard fittings and valves are inexpensive; large markups on them should be explainable.' },
      { question: '"Is there a cheaper repair that would hold, even if it is not the full fix?"', why: 'A fair plumber will tell you the repair-vs-replace tradeoff honestly instead of defaulting to the biggest job.' },
    ],
  },
  electrical: {
    typicalVisitRange: [75, 400],
    lineBenchmarks: [
      { match: ['diagnostic', 'trip', 'service fee', 'service call'], label: 'Diagnostic / trip fee', range: [75, 140] },
      { match: ['outlet', 'receptacle', 'gfci'], label: 'Outlet / GFCI (each)', range: [75, 120] },
      { match: ['breaker'], label: 'Breaker replacement', range: [120, 250] },
      { match: ['panel'], label: 'Panel work', range: [300, 1200] },
      { match: ['fixture', 'light', 'ceiling fan', 'fan'], label: 'Fixture / fan install', range: [100, 300] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [95, 165] },
    ],
    cannedQuestions: [
      { question: '"Is a permit required for this work, and is it included in the price?"', why: 'Skipping a required permit saves them money, not you — it can bite you at resale or with insurance.' },
      { question: '"How many outlets/fixtures does this price cover, and what is the per-unit rate?"', why: 'Per-unit pricing should drop after the first one — the trip and setup are already paid for.' },
      { question: '"Is the panel actually at capacity, or can the new circuit fit the existing panel?"', why: 'Panel upgrades are a big-ticket add-on; get the load calculation, not just the recommendation.' },
    ],
  },
  roofing: {
    typicalVisitRange: [300, 1500],
    lineBenchmarks: [
      { match: ['inspection'], label: 'Roof inspection', range: [0, 250] },
      { match: ['shingle', 'patch', 'repair'], label: 'Shingle repair / patch', range: [300, 900] },
      { match: ['flashing'], label: 'Flashing repair', range: [200, 500] },
      { match: ['leak'], label: 'Leak repair', range: [350, 1000] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [75, 140] },
      { match: ['gutter'], label: 'Gutter work', range: [150, 600] },
    ],
    cannedQuestions: [
      { question: '"Can you show me photos of the damage you found, on my roof?"', why: 'You should never pay for damage you have not seen — reputable roofers document everything.' },
      { question: '"Is this a repair quote or a replacement quote? What would just the repair cost?"', why: 'Some companies only sell replacements. A targeted repair often buys years at a fraction of the cost.' },
      { question: '"Does this include disposal, permits, and flashing — or are those add-ons?"', why: 'Lowball quotes grow later through \'unforeseen\' add-ons that were entirely foreseeable.' },
    ],
  },
  landscaping: {
    typicalVisitRange: [45, 300],
    lineBenchmarks: [
      { match: ['mow', 'lawn'], label: 'Mowing per visit', range: [45, 95] },
      { match: ['trim', 'hedge', 'prune'], label: 'Trimming / pruning', range: [60, 250] },
      { match: ['cleanup', 'clean-up', 'clean up'], label: 'Yard cleanup', range: [150, 450] },
      { match: ['mulch'], label: 'Mulch (per yard installed)', range: [80, 140] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [50, 90] },
      { match: ['tree'], label: 'Tree work', range: [250, 900] },
    ],
    cannedQuestions: [
      { question: '"Is this a one-time price or the first visit of a contract? What is the per-visit rate after?"', why: 'Intro pricing sometimes hides an above-market recurring rate.' },
      { question: '"Does the price include haul-away and disposal of the debris?"', why: 'Disposal is a common surprise add-on — pin it down before work starts.' },
      { question: '"How many crew-hours does this estimate assume?"', why: 'Crew-hours × a fair hourly rate is a quick sanity check on any landscaping quote.' },
    ],
  },
  painting: {
    typicalVisitRange: [200, 900],
    lineBenchmarks: [
      { match: ['room', 'interior'], label: 'Interior room (walls)', range: [200, 450] },
      { match: ['ceiling'], label: 'Ceiling (per room)', range: [100, 250] },
      { match: ['trim', 'baseboard', 'door'], label: 'Trim / doors', range: [50, 150] },
      { match: ['prep', 'patch', 'drywall'], label: 'Prep / patching', range: [75, 250] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [40, 75] },
      { match: ['paint', 'material'], label: 'Paint / materials', range: [30, 80] },
    ],
    cannedQuestions: [
      { question: '"How many coats does this include, and is primer separate?"', why: 'A one-coat price that becomes two coats mid-job is a classic escalation.' },
      { question: '"Is prep work — patching, sanding, taping — included in this number?"', why: 'Prep is half the job; quotes that exclude it are not comparable to ones that include it.' },
      { question: '"What paint line are you using, and what is the material budget?"', why: 'Contractor-grade vs premium paint is a real cost difference you should knowingly choose.' },
    ],
  },
  cleaning: {
    typicalVisitRange: [149, 400],
    lineBenchmarks: [
      { match: ['deep clean', 'deep-clean'], label: 'Deep clean', range: [149, 299] },
      { match: ['standard', 'regular', 'basic'], label: 'Standard clean', range: [100, 200] },
      { match: ['move', 'move-out', 'move out'], label: 'Move-in/out clean', range: [200, 450] },
      { match: ['carpet'], label: 'Carpet cleaning (per room)', range: [40, 90] },
      { match: ['window'], label: 'Window cleaning', range: [100, 300] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [35, 65] },
    ],
    cannedQuestions: [
      { question: '"Is this priced by the job or by the hour, and what happens if it takes longer?"', why: 'Open-ended hourly cleans can balloon; a capped or flat price protects you.' },
      { question: '"What exactly is included — inside appliances, baseboards, windows?"', why: 'The word \'deep clean\' has no standard definition; get the checklist.' },
      { question: '"Do you bring supplies and equipment, or is that extra?"', why: 'Supply fees are small but commonly appear as surprise line items.' },
    ],
  },
  remodeling: {
    typicalVisitRange: [500, 5000],
    lineBenchmarks: [
      { match: ['demo', 'demolition'], label: 'Demolition', range: [300, 1500] },
      { match: ['drywall'], label: 'Drywall (per room)', range: [300, 900] },
      { match: ['flooring', 'floor'], label: 'Flooring install (per sqft)', range: [3, 12] },
      { match: ['cabinet'], label: 'Cabinet install', range: [100, 300] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [60, 120] },
      { match: ['permit'], label: 'Permits', range: [100, 800] },
    ],
    cannedQuestions: [
      { question: '"Is this a fixed bid or an estimate? What happens if costs run over?"', why: 'The difference decides who absorbs overruns — you or them.' },
      { question: '"Can you itemize materials vs. labor vs. subcontractors?"', why: 'A single lump sum hides where the money actually goes and makes comparison impossible.' },
      { question: '"What is the payment schedule, and is any of it held until completion?"', why: 'Never pay the full amount up front; a completion holdback keeps everyone motivated.' },
    ],
  },
  handyperson: {
    typicalVisitRange: [75, 400],
    lineBenchmarks: [
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [50, 100] },
      { match: ['minimum', 'trip', 'service fee', 'service call'], label: 'Trip / minimum fee', range: [50, 125] },
      { match: ['mount', 'tv', 'hang'], label: 'Mounting / hanging', range: [60, 180] },
      { match: ['assembly', 'assemble'], label: 'Assembly', range: [50, 150] },
      { match: ['door', 'lock'], label: 'Door / lock work', range: [75, 250] },
    ],
    cannedQuestions: [
      { question: '"Is the first hour a minimum, and what is the rate after that?"', why: 'Minimums are normal; not knowing the after-rate is how small jobs get expensive.' },
      { question: '"Can you bundle these tasks into one visit at one rate?"', why: 'Per-task pricing on a single visit double-charges the trip time.' },
      { question: '"Are materials billed at cost, or with a markup?"', why: 'Receipt-plus-percentage is fair; opaque materials lines deserve a question.' },
    ],
  },
  windows: {
    typicalVisitRange: [200, 800],
    lineBenchmarks: [
      { match: ['window', 'replacement', 'install'], label: 'Window install (each)', range: [300, 800] },
      { match: ['glass', 'pane'], label: 'Glass/pane replacement', range: [150, 400] },
      { match: ['screen'], label: 'Screen repair', range: [30, 100] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [60, 110] },
      { match: ['seal', 'caulk'], label: 'Sealing / caulking', range: [75, 250] },
    ],
    cannedQuestions: [
      { question: '"What is the per-window price, and does it drop for multiple windows?"', why: 'Setup costs are shared across windows — the per-unit price should reflect that.' },
      { question: '"What brand and glass package is this, and what would the step-down option cost?"', why: 'Window pricing varies 3× by brand tier; you should choose the tier knowingly.' },
      { question: '"Does this include exterior trim, capping, and disposal of the old windows?"', why: 'These finish items are commonly excluded and added later.' },
    ],
  },
  concrete: {
    typicalVisitRange: [500, 3000],
    lineBenchmarks: [
      { match: ['driveway'], label: 'Driveway (per sqft)', range: [6, 14] },
      { match: ['patio', 'slab'], label: 'Patio / slab (per sqft)', range: [6, 12] },
      { match: ['sidewalk', 'walkway'], label: 'Sidewalk (per sqft)', range: [6, 12] },
      { match: ['crack', 'repair', 'patch'], label: 'Crack repair', range: [250, 800] },
      { match: ['labor', 'hour', '/hr', 'hourly'], label: 'Labor per hour', range: [50, 90] },
      { match: ['demo', 'removal', 'haul'], label: 'Demo / haul-away', range: [300, 1200] },
    ],
    cannedQuestions: [
      { question: '"What is the price per square foot, and what thickness and PSI is the pour?"', why: 'Per-sqft with specs is the only way to compare concrete quotes apples-to-apples.' },
      { question: '"Is rebar or wire mesh included, and is the base prep in this price?"', why: 'Skipped reinforcement and base prep is where cheap concrete quotes cut corners.' },
      { question: '"Does this include tear-out and haul-away of the existing concrete?"', why: 'Demo and disposal can be a third of the job — confirm it is in the number.' },
    ],
  },
};

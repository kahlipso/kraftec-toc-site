import type { WorkOrder } from '@/app/types/work-order';

// Single source of truth for work orders.
//
// LIVE PHASE (Vercel + Postgres): keep these two functions, but swap their
// insides for SQL queries — e.g. `SELECT * FROM work_orders WHERE id = $1`.
// The homepage and the detail page call these getters and never touch the data
// directly, so nothing else changes when the database arrives.

const workOrders: WorkOrder[] = [
  {
    id: 'KR-2049',
    title: 'Full AC system replacement',
    description: '3-ton Carrier heat pump replacing a 17-year-old R-22 system.',
    location: { city: 'Phoenix', state: 'AZ', zip: '85032' },
    completedDate: 'Mar 12, 2025',
    totalPaid: 8940,
    proName: 'Martinez & Reyes HVAC',
    proInitials: 'MR',
    proId: 'martinez-reyes',
    photos: [],
    photoCount: 8,
    verifiedAtMonths: 12,
    isFairPrice: true,
    headline: 'Full AC system replacement — 3-ton',
    headlineHighlight: 'Carrier heat pump',
    outcomeScore: 96,
    duration: '4 hr 20 min',
    walkedInto:
      '17-year-old Goodman unit running R-22 refrigerant (no longer manufactured). Homeowner reported the system was running 16+ hours a day in July without cooling below 84°F. Compressor showing electrical draw 30% above spec. Refrigerant lines visibly corroded; previous contractor had topped off refrigerant three times in two years without diagnosing the leak.',
    whatWeDid: [
      'Removed and properly disposed of old condenser, air handler, and 240 ft of corroded refrigerant line set',
      "Installed new Carrier Comfort 16 heat pump, 3-ton, 16 SEER2 — matched to the home's load calculation, not just the old unit's size",
      'Replaced all refrigerant lines, drain pan, and condensate line with new R-454B-compatible materials',
      'Pulled and passed Maricopa County mechanical permit; left inspection card on file with homeowner',
      "Registered the 10-year parts warranty with Carrier on the homeowner's behalf",
    ],
    priceBreakdown: [
      { label: 'Diagnostic', value: '$79 (waived)' },
      { label: 'Equipment', value: '$5,620' },
      { label: 'Labor', value: '$2,840' },
      { label: 'Permit + disposal', value: '$401' },
      { label: 'Warranty', value: '10 yr parts' },
    ],
    fairRangeNote: 'In the fair range for this region',
    feedback: {
      initials: 'DM',
      name: 'Diana M.',
      meta: 'Homeowner · Phoenix, AZ · Verified buyer',
      reviewedNote: 'Reviewed 12 months after job · March 14, 2026',
      quote:
        'Two other companies quoted me $11,400 and $13,200 for the same job and tried to pressure me into deciding the same day. Kraftec connected me with Martinez & Reyes, they walked me through what was wrong, and the quote was exactly what they said it would be. A year in, the new system has cut my July electric bill by about $90 a month.',
      scores: [
        { value: '9.6', label: 'Price was fair' },
        { value: '10.0', label: 'Held up at 12 mo' },
        { value: '9.4', label: 'Communication' },
        { value: '9.8', label: 'Cleanliness' },
      ],
    },
  },
  {
    id: 'KR-1847',
    title: 'Capacitor replacement',
    description: 'Saved homeowner $9,116 vs. a competing replacement quote.',
    location: { city: 'Mesa', state: 'AZ', zip: '85201' },
    completedDate: 'Feb 8, 2025',
    totalPaid: 284,
    proName: 'Desert Cool Services',
    proInitials: 'DC',
    proId: 'desert-cool',
    photos: [],
    photoCount: 8,
    verifiedAtMonths: 12,
    isFairPrice: true,
    headline: 'Capacitor replacement —',
    headlineHighlight: 'a $284 fix, not a $9,400 unit',
    outcomeScore: 98,
    duration: '35 min',
    walkedInto:
      'Homeowner was told by another company that the entire condenser needed replacing for $9,400. The actual fault was a failed run capacitor — a $15 part — causing the compressor to fail to start on hot afternoons.',
    whatWeDid: [
      'Diagnosed the no-cool call: failed run capacitor reading well below its rated microfarads',
      'Replaced with a correctly rated dual-run capacitor and verified startup amperage within spec',
      'Inspected the contactor and refrigerant charge to confirm no underlying issue was being masked',
    ],
    priceBreakdown: [
      { label: 'Diagnostic', value: '$89' },
      { label: 'Part', value: '$45' },
      { label: 'Labor', value: '$150' },
      { label: 'Warranty', value: '2 yr part' },
    ],
    fairRangeNote: 'In the fair range for this region',
    feedback: {
      initials: 'RT',
      name: 'Robert T.',
      meta: 'Homeowner · Mesa, AZ · Verified buyer',
      reviewedNote: 'Reviewed 12 months after job · Feb 10, 2026',
      quote:
        'Another company had me convinced I needed a whole new AC for almost ten grand. Desert Cool found it was a $15 part in ten minutes. Still running perfectly a year later.',
      scores: [
        { value: '10.0', label: 'Price was fair' },
        { value: '10.0', label: 'Held up at 12 mo' },
        { value: '9.7', label: 'Communication' },
        { value: '9.5', label: 'Cleanliness' },
      ],
    },
  },
  {
    id: 'KR-1923',
    title: 'Air handler + ductwork',
    description: 'Replaced failed air handler in attic. Airflow up 22%.',
    location: { city: 'Scottsdale', state: 'AZ', zip: '85251' },
    completedDate: 'Feb 22, 2025',
    totalPaid: 4210,
    proName: 'Valley Air & Heat',
    proInitials: 'VA',
    proId: 'valley-air',
    photos: [],
    photoCount: 8,
    verifiedAtMonths: 12,
    isFairPrice: true,
    headline: 'Air handler replacement +',
    headlineHighlight: 'duct rework',
    outcomeScore: 94,
    duration: '6 hr',
    walkedInto:
      'Failed blower motor in an attic air handler, plus two collapsed flex-duct runs choking airflow to the back bedrooms. Rooms furthest from the unit were 6–8°F warmer than the thermostat setting.',
    whatWeDid: [
      'Replaced the attic air handler with a properly sized variable-speed unit',
      'Re-ran two collapsed supply runs with rigid takeoffs and new insulated flex',
      'Balanced the system and measured a 22% airflow improvement to the rear rooms',
    ],
    priceBreakdown: [
      { label: 'Diagnostic', value: '$89 (waived)' },
      { label: 'Equipment', value: '$2,650' },
      { label: 'Labor', value: '$1,320' },
      { label: 'Materials', value: '$151' },
      { label: 'Warranty', value: '5 yr parts' },
    ],
    fairRangeNote: 'In the fair range for this region',
    feedback: {
      initials: 'PK',
      name: 'Priya K.',
      meta: 'Homeowner · Scottsdale, AZ · Verified buyer',
      reviewedNote: 'Reviewed 12 months after job · Feb 25, 2026',
      quote:
        'The back bedrooms were always hot no matter what we set the thermostat to. Valley Air found collapsed ducts the last company never mentioned. The whole house is even now.',
      scores: [
        { value: '9.5', label: 'Price was fair' },
        { value: '9.8', label: 'Held up at 12 mo' },
        { value: '9.2', label: 'Communication' },
        { value: '9.6', label: 'Cleanliness' },
      ],
    },
  },
  {
    id: 'KR-1981',
    title: 'Mini-split installation',
    description: 'Daikin ductless system for a converted garage. Quiet, efficient.',
    location: { city: 'Tempe', state: 'AZ', zip: '85281' },
    completedDate: 'May 3, 2025',
    totalPaid: 6800,
    proName: 'Sunwest Mechanical',
    proInitials: 'SW',
    proId: 'sunwest',
    photos: [],
    photoCount: 8,
    verifiedAtMonths: 12,
    isFairPrice: true,
    headline: 'Ductless mini-split install —',
    headlineHighlight: 'Daikin converted garage',
    outcomeScore: 97,
    duration: '5 hr 10 min',
    walkedInto:
      'A converted garage office with no conditioning, regularly hitting 95°F in the afternoon. No existing ductwork and no easy way to extend the main system without a costly run.',
    whatWeDid: [
      'Installed a single-zone Daikin 18k BTU ductless mini-split with an inverter compressor',
      'Mounted the head high on the interior wall and routed the line set cleanly through the exterior',
      'Set up the condensate drain and verified quiet operation under 19 dB at idle',
    ],
    priceBreakdown: [
      { label: 'Diagnostic', value: '$0 (free quote)' },
      { label: 'Equipment', value: '$4,200' },
      { label: 'Labor', value: '$2,300' },
      { label: 'Materials', value: '$300' },
      { label: 'Warranty', value: '12 yr parts' },
    ],
    fairRangeNote: 'In the fair range for this region',
    feedback: {
      initials: 'AL',
      name: 'Andre L.',
      meta: 'Homeowner · Tempe, AZ · Verified buyer',
      reviewedNote: 'Reviewed 12 months after job · May 6, 2026',
      quote:
        'My garage office was unusable in summer. Sunwest had a mini-split in by the afternoon and it is dead silent. Best money I have spent on the house.',
      scores: [
        { value: '9.9', label: 'Price was fair' },
        { value: '9.9', label: 'Held up at 12 mo' },
        { value: '9.6', label: 'Communication' },
        { value: '9.7', label: 'Cleanliness' },
      ],
    },
  },
];

/** All recent work orders, for the homepage list. */
export function getRecentWorkOrders(): WorkOrder[] {
  return workOrders;
}

/** A single work order by id, or undefined if it doesn't exist. */
export function getWorkOrder(id: string): WorkOrder | undefined {
  return workOrders.find((order) => order.id === id);
}

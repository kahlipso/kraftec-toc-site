import type { ProProfile } from '@/app/types/pro';

// Source of truth for pro profiles. Mock for now; later this becomes a DB query
// (same seam as work-orders.ts: keep getPro(id), swap the insides for SQL).

const pros: ProProfile[] = [
  {
    id: 'martinez-reyes',
    initials: 'MR',
    name: 'Martinez & Reyes HVAC',
    type: 'Family-owned',
    location: 'Rancho Santa Margarita, CA',
    yearsOperating: 14,
    tags: ['Residential', 'Repair', 'Replacement', 'Spanish-speaking'],
    outcomeScore: 96,
    verification: [
      { title: 'Contractor license (CA)', detail: 'CSLB #287541 — confirmed active.', status: 'Verified · 11 days ago' },
      { title: 'General liability insurance', detail: '$2M policy confirmed with carrier.', status: 'Verified · this month' },
      { title: 'EPA 608 certification', detail: 'Universal cert, all 3 technicians.', status: 'Verified · 22 days ago' },
      { title: 'Background check', detail: 'Owner + all field techs via Checkr.', status: 'Refreshed · 4 mo ago' },
      { title: 'Bonded', detail: '$15,000 surety bond active.', status: 'Verified · this month' },
      { title: 'Regulatory complaints', detail: 'No unresolved complaints on file.', status: 'Checked · 6 days ago' },
    ],
    performance: [
      { value: '96%', label: 'Callback-free at 12 mo', sublabel: 'vs. 78% area avg' },
      { value: '94%', label: 'On time to appointment', sublabel: '94 of last 100 jobs' },
      { value: '42 min', label: 'Median response time', sublabel: 'During business hours' },
      { value: '+4%', label: 'Avg price vs. fair range', sublabel: 'Within fair band' },
    ],
    reviews: [
      { label: 'Price was fair', score: 9.4 },
      { label: 'Showed up on time', score: 9.1 },
      { label: 'The fix held up (12 mo)', score: 9.6 },
      { label: 'Diagnosis accurate', score: 9.3 },
      { label: 'Communication', score: 8.9 },
      { label: 'Cleanliness on site', score: 9.7 },
    ],
  },
  {
    id: 'desert-cool',
    initials: 'DC',
    name: 'Desert Cool Services',
    type: 'Owner-operator',
    location: 'Mesa, AZ',
    yearsOperating: 9,
    tags: ['Residential', 'Repair', 'Maintenance'],
    outcomeScore: 98,
    verification: [
      { title: 'Contractor license (AZ)', detail: 'ROC #331204 — confirmed active.', status: 'Verified · 8 days ago' },
      { title: 'General liability insurance', detail: '$1M policy confirmed with carrier.', status: 'Verified · this month' },
      { title: 'EPA 608 certification', detail: 'Universal cert on file.', status: 'Verified · 1 mo ago' },
      { title: 'Background check', detail: 'Owner verified via Checkr.', status: 'Refreshed · 3 mo ago' },
      { title: 'Bonded', detail: '$10,000 surety bond active.', status: 'Verified · this month' },
      { title: 'Regulatory complaints', detail: 'No unresolved complaints on file.', status: 'Checked · 5 days ago' },
    ],
    performance: [
      { value: '98%', label: 'Callback-free at 12 mo', sublabel: 'vs. 78% area avg' },
      { value: '97%', label: 'On time to appointment', sublabel: '97 of last 100 jobs' },
      { value: '28 min', label: 'Median response time', sublabel: 'During business hours' },
      { value: '−2%', label: 'Avg price vs. fair range', sublabel: 'Within fair band' },
    ],
    reviews: [
      { label: 'Price was fair', score: 9.8 },
      { label: 'Showed up on time', score: 9.6 },
      { label: 'The fix held up (12 mo)', score: 9.9 },
      { label: 'Diagnosis accurate', score: 9.7 },
      { label: 'Communication', score: 9.5 },
      { label: 'Cleanliness on site', score: 9.4 },
    ],
  },
  {
    id: 'valley-air',
    initials: 'VA',
    name: 'Valley Air & Heat',
    type: 'Family-owned',
    location: 'Scottsdale, AZ',
    yearsOperating: 18,
    tags: ['Residential', 'Commercial', 'Ductwork', 'Replacement'],
    outcomeScore: 94,
    verification: [
      { title: 'Contractor license (AZ)', detail: 'ROC #210558 — confirmed active.', status: 'Verified · 14 days ago' },
      { title: 'General liability insurance', detail: '$2M policy confirmed with carrier.', status: 'Verified · this month' },
      { title: 'EPA 608 certification', detail: 'Universal cert, 5 technicians.', status: 'Verified · 2 mo ago' },
      { title: 'Background check', detail: 'Owner + field techs via Checkr.', status: 'Refreshed · 5 mo ago' },
      { title: 'Bonded', detail: '$25,000 surety bond active.', status: 'Verified · this month' },
      { title: 'Regulatory complaints', detail: 'No unresolved complaints on file.', status: 'Checked · 9 days ago' },
    ],
    performance: [
      { value: '94%', label: 'Callback-free at 12 mo', sublabel: 'vs. 78% area avg' },
      { value: '91%', label: 'On time to appointment', sublabel: '91 of last 100 jobs' },
      { value: '55 min', label: 'Median response time', sublabel: 'During business hours' },
      { value: '+1%', label: 'Avg price vs. fair range', sublabel: 'Within fair band' },
    ],
    reviews: [
      { label: 'Price was fair', score: 9.2 },
      { label: 'Showed up on time', score: 9.0 },
      { label: 'The fix held up (12 mo)', score: 9.5 },
      { label: 'Diagnosis accurate', score: 9.1 },
      { label: 'Communication', score: 8.8 },
      { label: 'Cleanliness on site', score: 9.3 },
    ],
  },
  {
    id: 'sunwest',
    initials: 'SW',
    name: 'Sunwest Mechanical',
    type: 'Owner-operator',
    location: 'Tempe, AZ',
    yearsOperating: 7,
    tags: ['Residential', 'Mini-split', 'Install'],
    outcomeScore: 97,
    verification: [
      { title: 'Contractor license (AZ)', detail: 'ROC #344910 — confirmed active.', status: 'Verified · 6 days ago' },
      { title: 'General liability insurance', detail: '$1M policy confirmed with carrier.', status: 'Verified · this month' },
      { title: 'EPA 608 certification', detail: 'Universal cert on file.', status: 'Verified · 3 wk ago' },
      { title: 'Background check', detail: 'Owner verified via Checkr.', status: 'Refreshed · 2 mo ago' },
      { title: 'Bonded', detail: '$10,000 surety bond active.', status: 'Verified · this month' },
      { title: 'Regulatory complaints', detail: 'No unresolved complaints on file.', status: 'Checked · 4 days ago' },
    ],
    performance: [
      { value: '97%', label: 'Callback-free at 12 mo', sublabel: 'vs. 78% area avg' },
      { value: '96%', label: 'On time to appointment', sublabel: '96 of last 100 jobs' },
      { value: '38 min', label: 'Median response time', sublabel: 'During business hours' },
      { value: '0%', label: 'Avg price vs. fair range', sublabel: 'Within fair band' },
    ],
    reviews: [
      { label: 'Price was fair', score: 9.9 },
      { label: 'Showed up on time', score: 9.5 },
      { label: 'The fix held up (12 mo)', score: 9.8 },
      { label: 'Diagnosis accurate', score: 9.6 },
      { label: 'Communication', score: 9.4 },
      { label: 'Cleanliness on site', score: 9.7 },
    ],
  },
];

/** A single pro profile by id, or undefined if it doesn't exist. */
export function getPro(id: string): ProProfile | undefined {
  return pros.find((pro) => pro.id === id);
}

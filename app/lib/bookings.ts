import { getSql } from './db';
import type { BookingResult, DayColumn } from '@/app/types/booking';

// Booking data layer. Availability is computed: fixed daily start times across
// the next business days, minus rows that already exist in `bookings`. Booking
// = inserting a row; the UNIQUE (pro_id, slot_start) constraint is what makes
// two people racing for the same slot safe — the second insert fails cleanly.

/** Fixed daily start times (hour, label) — the rows of the week grid. */
const SLOT_TIMES: { time: string; label: string }[] = [
  { time: '08:00', label: '8:00 AM' },
  { time: '10:00', label: '10:00 AM' },
  { time: '13:00', label: '1:00 PM' },
  { time: '15:00', label: '3:00 PM' },
];

const DAYS_SHOWN = 5;

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** The next N business days (skipping weekends), starting tomorrow. */
function nextBusinessDays(count: number): Date[] {
  const days: Date[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    const dow = cursor.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cursor));
  }
  return days;
}

function slotIso(day: Date, time: string): string {
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${time}`;
}

/** Every bookable slot iso for the current window — used to validate submissions. */
export function validSlotIsos(): Set<string> {
  const set = new Set<string>();
  for (const day of nextBusinessDays(DAYS_SHOWN)) {
    for (const t of SLOT_TIMES) set.add(slotIso(day, t.time));
  }
  return set;
}

/** The week grid for a pro: next business days × fixed times, minus booked. */
export async function getAvailability(proId: string): Promise<DayColumn[]> {
  const sql = getSql();
  const days = nextBusinessDays(DAYS_SHOWN);
  const first = slotIso(days[0], '00:00');
  const last = slotIso(days[days.length - 1], '23:59');

  const rows = await sql`
    SELECT slot_start FROM bookings
    WHERE pro_id = ${proId} AND slot_start BETWEEN ${first} AND ${last}
  `;
  // Normalize DB timestamps to our iso key format (YYYY-MM-DDTHH:MM).
  const taken = new Set(
    rows.map((r) => {
      const d = new Date(r.slot_start as string);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }),
  );

  return days.map((day) => ({
    label: `${DAY_NAMES[day.getDay()]} ${MONTH_NAMES[day.getMonth()]} ${day.getDate()}`,
    slots: SLOT_TIMES.map((t) => {
      const iso = slotIso(day, t.time);
      return { iso, label: t.label, taken: taken.has(iso) };
    }),
  }));
}

/**
 * Normalize a US phone number to E.164 (+1XXXXXXXXXX) so "(949) 555-1234",
 * "949-555-1234" and "9495551234" are all the same customer. Null = invalid.
 */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return null;
}

export type CreateBookingInput = {
  proId: string;
  slotIso: string;
  name: string;
  phone: string;
  address: string;
  description: string;
};

/**
 * Create a booking: register (or silently link) the customer by phone, then
 * insert the booking. Returns welcomeBack so the UI can acknowledge returning
 * customers without ever revealing the stored name.
 */
export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const name = input.name.trim();
  const address = input.address.trim();
  if (!name || !address) return { ok: false, error: 'missing_fields' };

  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: 'invalid_phone' };

  // Only slots the grid could have shown are bookable (no past/invented times).
  if (!validSlotIsos().has(input.slotIso)) return { ok: false, error: 'invalid_slot' };

  const sql = getSql();

  // Upsert-by-phone: DO NOTHING keeps the existing record (silent linking) —
  // a stranger typing someone's number never overwrites or reveals their data.
  const inserted = await sql`
    INSERT INTO customers (phone, name) VALUES (${phone}, ${name})
    ON CONFLICT (phone) DO NOTHING
    RETURNING id
  `;
  const welcomeBack = inserted.length === 0;
  const customerId =
    (inserted[0]?.id as string | undefined) ??
    ((await sql`SELECT id FROM customers WHERE phone = ${phone}`)[0].id as string);

  try {
    await sql`
      INSERT INTO bookings (pro_id, customer_id, slot_start, address, description)
      VALUES (${input.proId}, ${customerId}, ${input.slotIso}, ${address}, ${input.description.trim()})
    `;
  } catch (e: unknown) {
    // 23505 = Postgres unique_violation → someone won the race for this slot.
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505') {
      return { ok: false, error: 'slot_taken' };
    }
    throw e;
  }

  return { ok: true, welcomeBack };
}

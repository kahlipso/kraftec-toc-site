// Booking domain: the week grid the customer picks from, and the result of a
// booking attempt. Availability is COMPUTED (fixed daily times minus existing
// bookings) — there is no stored "slots" table; a taken cell is simply a row
// that exists in `bookings` for (pro_id, slot_start).

export type SlotCell = {
  /** Slot identity, e.g. "2026-07-20T08:00" — becomes bookings.slot_start. */
  iso: string;
  /** Display label, e.g. "8:00 AM". */
  label: string;
  taken: boolean;
};

export type DayColumn = {
  /** e.g. "Mon Jul 20" */
  label: string;
  slots: SlotCell[];
};

export type BookingResult =
  | { ok: true; welcomeBack: boolean }
  | { ok: false; error: 'invalid_phone' | 'invalid_slot' | 'slot_taken' | 'missing_fields' };

'use server';

import { createBooking, normalizePhone } from '@/app/lib/bookings';
import { getAuthenticatedCustomer } from '@/app/lib/auth';
import { getPro } from '@/app/lib/pros';
import { sendSms, formatSlotForSms } from '@/app/lib/sms';
import type { BookingResult } from '@/app/types/booking';

// Server Action: the booking form calls this directly. All real validation
// (phone format, slot legitimacy, race handling) lives in createBooking.
export async function submitBooking(input: {
  proId: string;
  slotIso: string;
  address: string;
  description: string;
}): Promise<BookingResult> {
  const pro = await getPro(input.proId);
  if (!pro) return { ok: false, error: 'invalid_slot' };
  const customer = await getAuthenticatedCustomer();
  if (!customer) return { ok: false, error: 'unauthenticated' };

  const result = await createBooking({ ...input, name: customer.name, phone: customer.phone });

  // Confirmation text — only after the booking is safely in the database, and
  // best-effort: an SMS failure must never fail a booking that already exists.
  if (result.ok) {
    const to = normalizePhone(customer.phone);
    if (to) {
      const firstName = pro.contactName.split(' ')[0];
      await sendSms(
        to,
        `Kraftec: you're booked! ${pro.name} — ${formatSlotForSms(input.slotIso)}. ` +
          `${firstName} will give you a call before the inspection. Reply STOP to opt out.`,
      );
    }
  }

  return result;
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { bookingStatuses, requireAdmin } from '@/app/lib/admin';
import { normalizePhone } from '@/app/lib/bookings';
import { getSql } from '@/app/lib/db';

function value(data: FormData, name: string) { return String(data.get(name) ?? '').trim(); }

export async function updateBooking(data: FormData) {
  await requireAdmin();
  const id = value(data, 'id'); const status = value(data, 'status');
  if (!id || !bookingStatuses.includes(status as typeof bookingStatuses[number])) throw new Error('Invalid booking update.');
  const sql = getSql();
  await sql`UPDATE bookings SET status = ${status}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath(`/admin/requests/${id}`);
}

export async function archiveBooking(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE bookings SET archived_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin'); revalidatePath('/admin/requests'); redirect('/admin/requests');
}

export async function restoreBooking(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE bookings SET archived_at = NULL, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin/archive'); revalidatePath('/admin/requests');
}

export async function archivePro(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE pros SET archived_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin/technicians'); redirect('/admin/technicians');
}

export async function restorePro(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE pros SET archived_at = NULL WHERE id = ${id}`;
  revalidatePath('/admin/archive'); revalidatePath('/admin/technicians');
}

export async function archiveWorkOrder(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE work_orders SET archived_at = NOW(), updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin/work-orders'); redirect('/admin/work-orders');
}

export async function restoreWorkOrder(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const sql = getSql();
  await sql`UPDATE work_orders SET archived_at = NULL, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin/archive'); revalidatePath('/admin/work-orders'); revalidatePath('/work');
}

export async function deleteArchivedRecord(kind: 'booking' | 'pro' | 'work_order', id: string) {
  await requireAdmin(); const sql = getSql();
  if (kind === 'booking') await sql`DELETE FROM bookings b WHERE b.id = ${id} AND b.archived_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM work_orders w WHERE w.booking_id = b.id::text)`;
  if (kind === 'pro') await sql`DELETE FROM pros p WHERE p.id = ${id} AND p.archived_at IS NOT NULL AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.pro_id = p.id)`;
  if (kind === 'work_order') await sql`DELETE FROM work_orders WHERE id = ${id} AND archived_at IS NOT NULL`;
  revalidatePath('/admin/archive'); revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath('/admin/technicians'); revalidatePath('/admin/work-orders');
}

export async function updateWorkOrder(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const totalPaid = Number(value(data, 'totalPaid'));
  if (!id || !Number.isFinite(totalPaid)) throw new Error('Enter a valid total paid.');
  const sql = getSql();
  await sql`UPDATE work_orders SET title = ${value(data, 'title')}, description = ${value(data, 'description')}, total_paid = ${totalPaid}, outcome_score = ${Number(value(data, 'outcomeScore')) || 0}, verified_at_months = ${Number(value(data, 'verifiedAtMonths')) || 0}, is_published = ${data.get('isPublished') === 'on'}, updated_at = NOW() WHERE id = ${id}`;
  revalidatePath('/admin'); revalidatePath('/admin/work-orders'); revalidatePath(`/admin/work-orders/${id}`); revalidatePath('/work'); revalidatePath(`/work/${id}`);
}

export async function updatePro(data: FormData) {
  await requireAdmin(); const id = value(data, 'id'); const trades = value(data, 'trades').split(',').map((item) => item.trim()).filter(Boolean); const tags = value(data, 'tags').split(',').map((item) => item.trim()).filter(Boolean);
  const sql = getSql();
  await sql`UPDATE pros SET name = ${value(data, 'name')}, initials = ${value(data, 'initials')}, location = ${value(data, 'location')}, contact_name = ${value(data, 'contactName')}, note = ${value(data, 'note')}, trades = ${JSON.stringify(trades)}::jsonb, tags = ${JSON.stringify(tags)}::jsonb, outcome_score = ${Number(value(data, 'outcomeScore')) || 0} WHERE id = ${id}`;
  revalidatePath('/admin/technicians'); revalidatePath(`/admin/technicians/${id}`); revalidatePath(`/pro/${id}`); revalidatePath('/find-pro');
}

export async function updateCustomer(data: FormData) {
  await requireAdmin();
  const id = value(data, 'id'); const name = value(data, 'name'); const phone = normalizePhone(value(data, 'phone'));
  const email = value(data, 'email').toLowerCase();
  if (!id || name.length < 2 || !phone) throw new Error('Enter a full name and valid 10-digit US phone number.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
  const sql = getSql();
  const existing = await sql`SELECT phone FROM customers WHERE id = ${id}`;
  if (!existing[0]) throw new Error('Customer not found.');
  // Credentials remain optional for legacy customers; changing contact details
  // never creates a login or overwrites a password.
  if (email) await sql`UPDATE customers SET name = ${name}, phone = ${phone}, email = ${email} WHERE id = ${id}`;
  else await sql`UPDATE customers SET name = ${name}, phone = ${phone} WHERE id = ${id}`;
  revalidatePath('/admin/customers'); revalidatePath(`/admin/customers/${id}`); revalidatePath('/profile');
}

export async function createWorkOrder(data: FormData) {
  await requireAdmin();
  const id = value(data, 'id'); const bookingId = value(data, 'bookingId'); const title = value(data, 'title');
  const city = value(data, 'city'); const state = value(data, 'state'); const zip = value(data, 'zip');
  const completedDate = value(data, 'completedDate'); const totalPaid = Number(value(data, 'totalPaid'));
  if (!/^KR-\d{4,}$/.test(id) || !bookingId || !title || !city || !state || !zip || !completedDate || !Number.isFinite(totalPaid)) throw new Error('Complete all required work-order fields.');
  const sql = getSql();
  const bookingRows = await sql`
    SELECT b.pro_id, p.name AS pro_name, p.initials AS pro_initials
    FROM bookings b JOIN pros p ON p.id = b.pro_id WHERE b.id = ${bookingId}
  `;
  const booking = bookingRows[0]; if (!booking) throw new Error('Booking not found.');
  const steps = value(data, 'steps').split('\n').map((item) => item.trim()).filter(Boolean);
  const photos = value(data, 'photos').split('\n').map((item) => item.trim()).filter(Boolean);
  const priceBreakdown = value(data, 'priceBreakdown').split('\n').map((line) => { const [label, ...rest] = line.split('|'); return { label: label?.trim(), value: rest.join('|').trim() }; }).filter((line) => line.label && line.value);
  const feedback = { initials: value(data, 'customerInitials') || 'KH', name: value(data, 'customerName') || 'Kraftec homeowner', meta: value(data, 'customerMeta') || 'Homeowner', reviewedNote: value(data, 'reviewedNote') || 'Awaiting follow-up', quote: value(data, 'feedbackQuote'), scores: [] };
  await sql`
    INSERT INTO work_orders (id, booking_id, title, description, city, state, zip, completed_date, total_paid, pro_name, pro_initials, pro_id, photos, photo_count, verified_at_months, is_fair_price, headline, headline_highlight, outcome_score, duration, walked_into, what_we_did, price_breakdown, fair_range_note, feedback, is_published, updated_at)
    VALUES (${id}, ${bookingId}, ${title}, ${value(data, 'description')}, ${city}, ${state}, ${zip}, ${completedDate}, ${totalPaid}, ${booking.pro_name as string}, ${booking.pro_initials as string}, ${booking.pro_id as string}, ${JSON.stringify(photos)}::jsonb, ${photos.length}, ${Number(value(data, 'verifiedAtMonths')) || 0}, ${data.get('isFairPrice') === 'on'}, ${value(data, 'headline') || title}, ${value(data, 'headlineHighlight')}, ${Number(value(data, 'outcomeScore')) || 0}, ${value(data, 'duration')}, ${value(data, 'walkedInto')}, ${JSON.stringify(steps)}::jsonb, ${JSON.stringify(priceBreakdown)}::jsonb, ${value(data, 'fairRangeNote')}, ${JSON.stringify(feedback)}::jsonb, ${data.get('isPublished') === 'on'}, NOW())
  `;
  await sql`UPDATE bookings SET status = 'completed', updated_at = NOW() WHERE id = ${bookingId}`;
  revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath('/admin/work-orders'); redirect('/admin/work-orders');
}

export async function saveBenchmark(data: FormData) {
  await requireAdmin(); const trade = value(data, 'trade'); const config = value(data, 'config');
  if (!trade) throw new Error('A trade is required.');
  try { JSON.parse(config); } catch { throw new Error('Benchmark configuration must be valid JSON.'); }
  const sql = getSql();
  await sql`INSERT INTO quote_benchmarks (trade_slug, config) VALUES (${trade}, ${config}::jsonb) ON CONFLICT (trade_slug) DO UPDATE SET config = EXCLUDED.config, updated_at = NOW()`;
  revalidatePath('/admin/benchmarks');
}

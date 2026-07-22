'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { bookingStatuses, requireAdmin, type BookingStatus } from '@/app/lib/admin';
import { findOrCreateCustomerId, normalizePhone } from '@/app/lib/bookings';
import { getSql } from '@/app/lib/db';

function value(data: FormData, name: string) { return String(data.get(name) ?? '').trim(); }

const proStatuses = ['idle', 'working', 'finishing'] as const;

function slugify(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pro';
}

function parseJsonField(data: FormData, name: string) {
  const raw = value(data, name) || '[]';
  try { return JSON.parse(raw); } catch { throw new Error(`"${name}" must be valid JSON.`); }
}

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
  await requireAdmin();
  const id = value(data, 'id');
  const trades = value(data, 'trades').split(',').map((item) => item.trim()).filter(Boolean);
  const tags = value(data, 'tags').split(',').map((item) => item.trim()).filter(Boolean);
  const status = value(data, 'status');
  const lat = Number(value(data, 'lat'));
  const lng = Number(value(data, 'lng'));
  const serviceRadiusMiles = Number(value(data, 'serviceRadiusMiles'));
  if (!proStatuses.includes(status as typeof proStatuses[number])) throw new Error('Invalid status.');
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(serviceRadiusMiles)) {
    throw new Error('Enter valid latitude, longitude, and service radius.');
  }
  const verification = parseJsonField(data, 'verification');
  const performance = parseJsonField(data, 'performance');
  const reviews = parseJsonField(data, 'reviews');
  const sql = getSql();
  await sql`
    UPDATE pros SET
      name = ${value(data, 'name')}, initials = ${value(data, 'initials')}, type = ${value(data, 'type')},
      location = ${value(data, 'location')}, contact_name = ${value(data, 'contactName')}, note = ${value(data, 'note')},
      trades = ${JSON.stringify(trades)}::jsonb, tags = ${JSON.stringify(tags)}::jsonb,
      outcome_score = ${Number(value(data, 'outcomeScore')) || 0}, rating = ${Number(value(data, 'rating')) || 0},
      years_operating = ${Number(value(data, 'yearsOperating')) || 0}, verified_jobs = ${Number(value(data, 'verifiedJobs')) || 0},
      lat = ${lat}, lng = ${lng}, service_radius_miles = ${serviceRadiusMiles}, status = ${status},
      verification = ${JSON.stringify(verification)}::jsonb, performance = ${JSON.stringify(performance)}::jsonb,
      reviews = ${JSON.stringify(reviews)}::jsonb
    WHERE id = ${id}
  `;
  revalidatePath('/admin/technicians'); revalidatePath(`/admin/technicians/${id}`); revalidatePath(`/pro/${id}`); revalidatePath('/find-pro');
}

export async function createPro(data: FormData) {
  await requireAdmin();
  const name = value(data, 'name');
  const initials = value(data, 'initials');
  const location = value(data, 'location');
  const contactName = value(data, 'contactName');
  const trades = value(data, 'trades').split(',').map((item) => item.trim()).filter(Boolean);
  const tags = value(data, 'tags').split(',').map((item) => item.trim()).filter(Boolean);
  const lat = Number(value(data, 'lat'));
  const lng = Number(value(data, 'lng'));
  const serviceRadiusMiles = Number(value(data, 'serviceRadiusMiles')) || 15;
  if (!name || !initials || !location || !contactName || !trades.length) {
    throw new Error('Company name, initials, location, contact, and at least one trade are required.');
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("Pick an address to set the pro's location.");

  const sql = getSql();
  const base = slugify(name);
  let id = base;
  let suffix = 1;
  while ((await sql`SELECT 1 FROM pros WHERE id = ${id}`).length > 0) {
    suffix += 1;
    id = `${base}-${suffix}`;
  }

  await sql`
    INSERT INTO pros (
      id, name, initials, type, location, contact_name, note, trades, tags,
      lat, lng, service_radius_miles, status, outcome_score, rating, years_operating,
      verified_jobs, verification, performance, reviews
    ) VALUES (
      ${id}, ${name}, ${initials}, ${value(data, 'type')}, ${location}, ${contactName}, ${value(data, 'note')},
      ${JSON.stringify(trades)}::jsonb, ${JSON.stringify(tags)}::jsonb,
      ${lat}, ${lng}, ${serviceRadiusMiles}, 'idle', ${Number(value(data, 'outcomeScore')) || 0},
      ${Number(value(data, 'rating')) || 0}, ${Number(value(data, 'yearsOperating')) || 0},
      0, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
    )
  `;
  revalidatePath('/admin/technicians'); revalidatePath('/find-pro');
  redirect(`/admin/technicians/${id}`);
}

export async function createCustomer(data: FormData) {
  await requireAdmin();
  const name = value(data, 'name');
  const phone = normalizePhone(value(data, 'phone'));
  const email = value(data, 'email').toLowerCase();
  if (name.length < 2 || !phone) throw new Error('Enter a full name and valid 10-digit US phone number.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Enter a valid email address.');
  const sql = getSql();
  const existing = await sql`SELECT id FROM customers WHERE phone = ${phone}`;
  if (existing[0]) throw new Error('A customer with this phone number already exists.');
  const inserted = email
    ? await sql`INSERT INTO customers (name, phone, email) VALUES (${name}, ${phone}, ${email}) RETURNING id`
    : await sql`INSERT INTO customers (name, phone) VALUES (${name}, ${phone}) RETURNING id`;
  revalidatePath('/admin/customers');
  redirect(`/admin/customers/${inserted[0].id}`);
}

export async function createRequest(data: FormData) {
  await requireAdmin();
  const proId = value(data, 'proId');
  const name = value(data, 'name');
  const phone = normalizePhone(value(data, 'phone'));
  const slotStart = value(data, 'slotStart');
  const address = value(data, 'address');
  const description = value(data, 'description');
  const status = value(data, 'status') || 'new';
  if (!proId || !name || !phone || !slotStart || !address) {
    throw new Error('Pro, customer name, phone, time, and address are all required.');
  }
  if (!bookingStatuses.includes(status as BookingStatus)) throw new Error('Invalid status.');

  const sql = getSql();
  const proRows = await sql`SELECT 1 FROM pros WHERE id = ${proId} AND archived_at IS NULL`;
  if (!proRows[0]) throw new Error('Pro not found.');
  const { id: customerId } = await findOrCreateCustomerId(sql, name, phone);

  let bookingId: string;
  try {
    const inserted = await sql`
      INSERT INTO bookings (pro_id, customer_id, slot_start, address, description, status)
      VALUES (${proId}, ${customerId}, ${slotStart}, ${address}, ${description}, ${status})
      RETURNING id
    `;
    bookingId = inserted[0].id as string;
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === '23505') {
      throw new Error('That pro already has a request at that exact time.');
    }
    throw e;
  }
  revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath('/admin/customers');
  redirect(`/admin/requests/${bookingId}`);
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

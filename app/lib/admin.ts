import 'server-only';

import { redirect } from 'next/navigation';
import { getAuthenticatedCustomer } from './auth';
import { getSql } from './db';

export const bookingStatuses = ['new', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const;
export type BookingStatus = typeof bookingStatuses[number];

export type AdminBooking = {
  id: string;
  status: BookingStatus;
  slotStart: string;
  address: string;
  description: string;
  customerName: string;
  customerPhone: string;
  proName: string;
  proInitials: string;
  proId: string;
  archivedAt: string | null;
};

export function isAdminEmail(email: string) {
  const allowed = (process.env.ADMIN_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}

export async function requireAdmin() {
  const customer = await getAuthenticatedCustomer();
  if (!customer || !isAdminEmail(customer.email)) redirect('/');
  return customer;
}

function rowToBooking(row: Record<string, unknown>): AdminBooking {
  return {
    id: row.id as string,
    status: row.status as BookingStatus,
    slotStart: new Date(row.slot_start as string).toISOString(),
    address: row.address as string,
    description: row.description as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    proName: row.pro_name as string,
    proInitials: row.pro_initials as string,
    proId: row.pro_id as string,
    archivedAt: row.archived_at ? new Date(row.archived_at as string).toISOString() : null,
  };
}

const bookingSelect = `
  SELECT b.id, b.status, b.slot_start, b.address, b.description, b.archived_at, b.pro_id,
         c.name AS customer_name, c.phone AS customer_phone,
         p.name AS pro_name, p.initials AS pro_initials
  FROM bookings b
  JOIN customers c ON c.id = b.customer_id
  JOIN pros p ON p.id = b.pro_id
`;

export async function getAdminBookings({ archived = false }: { archived?: boolean } = {}) {
  const sql = getSql();
  const rows = archived
    ? await sql`${sql.unsafe(bookingSelect)} WHERE b.archived_at IS NOT NULL ORDER BY b.slot_start DESC`
    : await sql`${sql.unsafe(bookingSelect)} WHERE b.archived_at IS NULL ORDER BY b.slot_start ASC`;
  return rows.map(rowToBooking);
}

export async function getAdminBooking(id: string) {
  const sql = getSql();
  const rows = await sql`${sql.unsafe(bookingSelect)} WHERE b.id = ${id}`;
  return rows[0] ? rowToBooking(rows[0]) : null;
}

export async function getAdminOverview() {
  const sql = getSql();
  const [newRows, todayRows, progressRows, draftRows, recent] = await Promise.all([
    sql`SELECT COUNT(*)::int AS count FROM bookings WHERE archived_at IS NULL AND status = 'new'`,
    sql`SELECT COUNT(*)::int AS count FROM bookings WHERE archived_at IS NULL AND slot_start::date = CURRENT_DATE`,
    sql`SELECT COUNT(*)::int AS count FROM bookings WHERE archived_at IS NULL AND status = 'in_progress'`,
    sql`SELECT COUNT(*)::int AS count FROM work_orders WHERE archived_at IS NULL AND is_published = FALSE`,
    sql`${sql.unsafe(bookingSelect)} WHERE b.archived_at IS NULL ORDER BY b.slot_start ASC LIMIT 6`,
  ]);
  return {
    counts: { new: newRows[0].count as number, today: todayRows[0].count as number, inProgress: progressRows[0].count as number, drafts: draftRows[0].count as number },
    recent: recent.map(rowToBooking),
  };
}

export async function getAdminPros({ archived = false }: { archived?: boolean } = {}) {
  const sql = getSql();
  const rows = archived
    ? await sql`SELECT * FROM pros WHERE archived_at IS NOT NULL ORDER BY name`
    : await sql`SELECT * FROM pros WHERE archived_at IS NULL ORDER BY name`;
  return rows.map((row) => ({
    id: row.id as string, name: row.name as string, initials: row.initials as string,
    location: row.location as string, trades: row.trades as string[], contactName: row.contact_name as string,
    outcomeScore: row.outcome_score as number, verifiedJobs: row.verified_jobs as number,
  }));
}

export async function getAdminWorkOrders({ archived = false }: { archived?: boolean } = {}) {
  const sql = getSql();
  const rows = archived
    ? await sql`SELECT * FROM work_orders WHERE archived_at IS NOT NULL ORDER BY completed_date DESC`
    : await sql`SELECT * FROM work_orders WHERE archived_at IS NULL ORDER BY completed_date DESC`;
  return rows.map((row) => ({
    id: row.id as string, title: row.title as string, proName: row.pro_name as string,
    completedDate: row.completed_date as string, totalPaid: row.total_paid as number,
    published: row.is_published as boolean, verifiedAtMonths: row.verified_at_months as number,
  }));
}

export async function getAdminWorkOrder(id: string) {
  const sql = getSql(); const rows = await sql`SELECT * FROM work_orders WHERE id = ${id}`;
  if (!rows[0]) return null; const row = rows[0];
  return { id: row.id as string, title: row.title as string, description: row.description as string, totalPaid: row.total_paid as number, outcomeScore: row.outcome_score as number, verifiedAtMonths: row.verified_at_months as number, published: row.is_published as boolean, proName: row.pro_name as string, completedDate: row.completed_date as string };
}

export async function getAdminCustomers() {
  const sql = getSql();
  const rows = await sql`
    SELECT c.id, c.name, c.phone, COUNT(b.id)::int AS request_count, MAX(b.slot_start) AS latest_request
    FROM customers c LEFT JOIN bookings b ON b.customer_id = c.id
    GROUP BY c.id, c.name, c.phone ORDER BY latest_request DESC NULLS LAST
  `;
  return rows.map((row) => ({ id: row.id as string, name: row.name as string, phone: row.phone as string, requestCount: row.request_count as number, latestRequest: row.latest_request as string | null }));
}

export async function getAdminCustomer(id: string) {
  const sql = getSql();
  const customerRows = await sql`
    SELECT c.id, c.name, c.phone, c.email AS account_email
    FROM customers c
    WHERE c.id = ${id}
  `;
  const customer = customerRows[0];
  if (!customer) return null;
  const bookings = await sql`
    SELECT b.id, b.slot_start, b.status, b.address, b.description, p.name AS pro_name
    FROM bookings b JOIN pros p ON p.id = b.pro_id
    WHERE b.customer_id = ${id} ORDER BY b.slot_start DESC
  `;
  return {
    id: customer.id as string,
    name: customer.name as string,
    phone: customer.phone as string,
    email: customer.account_email as string | null,
    bookings: bookings.map((booking) => ({
      id: booking.id as string, slotStart: booking.slot_start as string,
      status: booking.status as BookingStatus, address: booking.address as string,
      description: booking.description as string, proName: booking.pro_name as string,
    })),
  };
}

export async function getAdminBenchmark(tradeSlug: string) {
  const sql = getSql();
  const rows = await sql`SELECT config, updated_at FROM quote_benchmarks WHERE trade_slug = ${tradeSlug}`;
  return rows[0] ? { config: rows[0].config, updatedAt: rows[0].updated_at as string } : null;
}

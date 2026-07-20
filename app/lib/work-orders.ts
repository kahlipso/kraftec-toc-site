import { getSql } from './db';
import type { WorkOrder } from '@/app/types/work-order';

// The database stores columns in snake_case (pro_name); our app uses camelCase
// (proName). This translates one DB row into a WorkOrder object.
function rowToWorkOrder(row: Record<string, unknown>): WorkOrder {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    location: {
      city: row.city as string,
      state: row.state as string,
      zip: row.zip as string,
    },
    completedDate: row.completed_date as string,
    totalPaid: row.total_paid as number,
    proName: row.pro_name as string,
    proInitials: row.pro_initials as string,
    proId: row.pro_id as string,
    photos: row.photos as string[],
    photoCount: row.photo_count as number,
    verifiedAtMonths: row.verified_at_months as number,
    isFairPrice: row.is_fair_price as boolean,
    headline: row.headline as string,
    headlineHighlight: row.headline_highlight as string,
    outcomeScore: row.outcome_score as number,
    duration: row.duration as string,
    walkedInto: row.walked_into as string,
    whatWeDid: row.what_we_did as string[],
    priceBreakdown: row.price_breakdown as WorkOrder['priceBreakdown'],
    fairRangeNote: row.fair_range_note as string,
    feedback: row.feedback as WorkOrder['feedback'],
  };
}

/** Newest completion date first ("Mar 12, 2025" strings parse fine as dates). */
function byMostRecent(a: WorkOrder, b: WorkOrder): number {
  return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
}

function isMissingAdminColumn(error: unknown) {
  return typeof error === 'object' && error !== null &&
    (String((error as { message?: unknown }).message).includes('archived_at') ||
      String((error as { message?: unknown }).message).includes('is_published'));
}

/** All work orders, most recently completed first. */
export async function getRecentWorkOrders(): Promise<WorkOrder[]> {
  const sql = getSql();
  let rows;
  try {
    rows = await sql`SELECT * FROM work_orders WHERE archived_at IS NULL AND is_published = TRUE`;
  } catch (error) {
    // The public site stays live until the optional admin migration is applied.
    if (!isMissingAdminColumn(error)) throw error;
    rows = await sql`SELECT * FROM work_orders`;
  }
  return rows.map(rowToWorkOrder).sort(byMostRecent);
}

/** A single work order by id, or undefined if it doesn't exist. */
export async function getWorkOrder(id: string): Promise<WorkOrder | undefined> {
  const sql = getSql();
  let rows;
  try {
    rows = await sql`SELECT * FROM work_orders WHERE id = ${id} AND archived_at IS NULL AND is_published = TRUE`;
  } catch (error) {
    if (!isMissingAdminColumn(error)) throw error;
    rows = await sql`SELECT * FROM work_orders WHERE id = ${id}`;
  }
  return rows[0] ? rowToWorkOrder(rows[0]) : undefined;
}

/** All work orders completed by a given pro, for the pro profile page. */
export async function getWorkOrdersByPro(proId: string): Promise<WorkOrder[]> {
  const sql = getSql();
  let rows;
  try {
    rows = await sql`SELECT * FROM work_orders WHERE pro_id = ${proId} AND archived_at IS NULL AND is_published = TRUE ORDER BY id DESC`;
  } catch (error) {
    if (!isMissingAdminColumn(error)) throw error;
    rows = await sql`SELECT * FROM work_orders WHERE pro_id = ${proId} ORDER BY id DESC`;
  }
  return rows.map(rowToWorkOrder);
}

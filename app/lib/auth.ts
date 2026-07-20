import 'server-only';

import { cookies } from 'next/headers';
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getSql } from './db';
import { normalizePhone } from './bookings';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'kraftec_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthenticatedCustomer = { id: string; name: string; email: string; phone: string };
type CustomerAuthRow = AuthenticatedCustomer & { password_hash: string; password_salt: string };

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
async function hashPassword(password: string, salt: string) { return ((await scrypt(password, salt, 64)) as Buffer).toString('hex'); }
function publicCustomer(row: CustomerAuthRow): AuthenticatedCustomer { return { id: row.id, name: row.name, email: row.email, phone: row.phone }; }

/** A customer with credentials is an account; customers without credentials can still book. */
export async function findAccountByPhone(phoneInput: string): Promise<AuthenticatedCustomer | null> {
  const phone = normalizePhone(phoneInput); if (!phone) return null;
  const sql = getSql();
  const rows = await sql`SELECT id, name, email, phone FROM customers WHERE phone = ${phone} AND password_hash IS NOT NULL`;
  return (rows[0] as AuthenticatedCustomer | undefined) ?? null;
}

async function createSession(customerId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const sql = getSql();
  await sql`DELETE FROM customer_sessions WHERE expires_at <= NOW()`;
  await sql`INSERT INTO customer_sessions (token_hash, account_id, expires_at) VALUES (${hashToken(token)}, ${customerId}, ${expiresAt.toISOString()})`;
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: SESSION_MAX_AGE_SECONDS });
}

export async function registerCustomer(input: { phone: string; name: string; email: string; password: string }): Promise<{ ok: true; customer: AuthenticatedCustomer } | { ok: false; error: string }> {
  const phone = normalizePhone(input.phone); const name = input.name.trim(); const email = input.email.trim().toLowerCase();
  if (!phone) return { ok: false, error: 'Enter a valid 10-digit US phone number.' };
  if (name.length < 2) return { ok: false, error: 'Enter your full name.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (input.password.length < 8) return { ok: false, error: 'Use a password with at least 8 characters.' };
  const sql = getSql();
  const phoneAccount = await findAccountByPhone(phone);
  if (phoneAccount) return { ok: false, error: 'An account already exists for this phone number. Please log in.' };
  const emailRows = await sql`SELECT id FROM customers WHERE email = ${email}`;
  if (emailRows[0]) return { ok: false, error: 'An account already exists with that email.' };
  const salt = randomBytes(16).toString('hex'); const passwordHash = await hashPassword(input.password, salt);
  const existingCustomer = await sql`SELECT id FROM customers WHERE phone = ${phone}`;
  const id = (existingCustomer[0]?.id as string | undefined) ?? randomUUID();
  try {
    if (existingCustomer[0]) await sql`UPDATE customers SET name = ${name}, email = ${email}, password_hash = ${passwordHash}, password_salt = ${salt} WHERE id = ${id}`;
    else await sql`INSERT INTO customers (id, phone, name, email, password_hash, password_salt) VALUES (${id}, ${phone}, ${name}, ${email}, ${passwordHash}, ${salt})`;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505') return { ok: false, error: 'An account already exists with that phone number or email.' };
    throw error;
  }
  const customer = { id, phone, name, email }; await createSession(id); return { ok: true, customer };
}

export async function loginCustomer(input: { phone: string; password: string }): Promise<{ ok: true; customer: AuthenticatedCustomer } | { ok: false; error: string }> {
  const phone = normalizePhone(input.phone); if (!phone) return { ok: false, error: 'Enter a valid 10-digit US phone number.' };
  const sql = getSql();
  const rows = await sql`SELECT id, name, email, phone, password_hash, password_salt FROM customers WHERE phone = ${phone} AND password_hash IS NOT NULL`;
  const customer = rows[0] as CustomerAuthRow | undefined;
  if (!customer) return { ok: false, error: 'We could not find an account for that phone number.' };
  const actual = Buffer.from(await hashPassword(input.password, customer.password_salt), 'hex'); const expected = Buffer.from(customer.password_hash, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return { ok: false, error: 'Incorrect password. Please try again.' };
  await createSession(customer.id); return { ok: true, customer: publicCustomer(customer) };
}

export async function getAuthenticatedCustomer(): Promise<AuthenticatedCustomer | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value; if (!token) return null;
  const sql = getSql();
  const rows = await sql`
    SELECT c.id, c.name, c.email, c.phone FROM customer_sessions s
    JOIN customers c ON c.id = s.account_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > NOW()
  `;
  return (rows[0] as AuthenticatedCustomer | undefined) ?? null;
}

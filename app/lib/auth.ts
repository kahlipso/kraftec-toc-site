import 'server-only';

import { cookies } from 'next/headers';
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { getSql } from './db';
import { normalizePhone } from './bookings';

const scrypt = promisify(scryptCallback);
const SESSION_COOKIE = 'kraftec_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthenticatedCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

type AccountRow = AuthenticatedCustomer & { password_hash: string; password_salt: string };

// This project has no migration runner yet. Keeping the bootstrap idempotent lets
// the first auth request create the two tables on the same Neon database that
// already stores bookings. Move this into a formal migration when one is added.
async function ensureAuthSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS customer_accounts (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      password_salt TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS customer_sessions (
      token_hash TEXT PRIMARY KEY,
      account_id TEXT NOT NULL REFERENCES customer_accounts(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

async function hashPassword(password: string, salt: string) {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return derived.toString('hex');
}

function publicAccount(row: AccountRow): AuthenticatedCustomer {
  return { id: row.id, name: row.name, email: row.email, phone: row.phone };
}

export async function findAccountByPhone(phoneInput: string): Promise<AuthenticatedCustomer | null> {
  const phone = normalizePhone(phoneInput);
  if (!phone) return null;

  await ensureAuthSchema();
  const sql = getSql();
  const rows = await sql`SELECT id, name, email, phone FROM customer_accounts WHERE phone = ${phone}`;
  const row = rows[0] as AuthenticatedCustomer | undefined;
  return row ?? null;
}

async function createSession(accountId: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
  const sql = getSql();
  await sql`DELETE FROM customer_sessions WHERE expires_at <= NOW()`;
  await sql`
    INSERT INTO customer_sessions (token_hash, account_id, expires_at)
    VALUES (${hashToken(token)}, ${accountId}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function registerCustomer(input: {
  phone: string;
  name: string;
  email: string;
  password: string;
}): Promise<{ ok: true; customer: AuthenticatedCustomer } | { ok: false; error: string }> {
  const phone = normalizePhone(input.phone);
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!phone) return { ok: false, error: 'Enter a valid 10-digit US phone number.' };
  if (name.length < 2) return { ok: false, error: 'Enter your full name.' };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Enter a valid email address.' };
  if (input.password.length < 8) return { ok: false, error: 'Use a password with at least 8 characters.' };

  await ensureAuthSchema();
  const existing = await findAccountByPhone(phone);
  if (existing) return { ok: false, error: 'An account already exists for this phone number. Please log in.' };

  const salt = randomBytes(16).toString('hex');
  const passwordHash = await hashPassword(input.password, salt);
  const customer: AuthenticatedCustomer = { id: randomUUID(), phone, name, email };
  const sql = getSql();
  try {
    await sql`
      INSERT INTO customer_accounts (id, phone, name, email, password_hash, password_salt)
      VALUES (${customer.id}, ${phone}, ${name}, ${email}, ${passwordHash}, ${salt})
    `;
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505') {
      return { ok: false, error: 'An account already exists with that phone number or email.' };
    }
    throw error;
  }

  await createSession(customer.id);
  return { ok: true, customer };
}

export async function loginCustomer(input: {
  phone: string;
  password: string;
}): Promise<{ ok: true; customer: AuthenticatedCustomer } | { ok: false; error: string }> {
  const phone = normalizePhone(input.phone);
  if (!phone) return { ok: false, error: 'Enter a valid 10-digit US phone number.' };

  await ensureAuthSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, phone, password_hash, password_salt
    FROM customer_accounts WHERE phone = ${phone}
  `;
  const account = rows[0] as AccountRow | undefined;
  if (!account) return { ok: false, error: 'We could not find an account for that phone number.' };

  const actual = Buffer.from(await hashPassword(input.password, account.password_salt), 'hex');
  const expected = Buffer.from(account.password_hash, 'hex');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return { ok: false, error: 'Incorrect password. Please try again.' };
  }

  await createSession(account.id);
  return { ok: true, customer: publicAccount(account) };
}

export async function getAuthenticatedCustomer(): Promise<AuthenticatedCustomer | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  await ensureAuthSchema();
  const sql = getSql();
  const rows = await sql`
    SELECT a.id, a.name, a.email, a.phone
    FROM customer_sessions s
    JOIN customer_accounts a ON a.id = s.account_id
    WHERE s.token_hash = ${hashToken(token)} AND s.expires_at > NOW()
  `;
  return (rows[0] as AuthenticatedCustomer | undefined) ?? null;
}

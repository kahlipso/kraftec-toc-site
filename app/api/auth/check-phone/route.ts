import { normalizePhone } from '@/app/lib/bookings';
import { findAccountByPhone } from '@/app/lib/auth';

export async function POST(request: Request) {
  let body: { phone?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (typeof body.phone !== 'string' || !normalizePhone(body.phone)) {
    return Response.json({ error: 'Enter a valid US phone number.' }, { status: 400 });
  }

  const account = await findAccountByPhone(body.phone);
  return Response.json({ exists: account !== null });
}

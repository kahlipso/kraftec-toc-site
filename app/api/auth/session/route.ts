import { getAuthenticatedCustomer } from '@/app/lib/auth';

export async function GET() {
  const customer = await getAuthenticatedCustomer();
  return Response.json({ customer });
}

import { put } from '@vercel/blob';
import { isAdminEmail } from '@/app/lib/admin';
import { getAuthenticatedCustomer } from '@/app/lib/auth';

export async function POST(request: Request) {
  const customer = await getAuthenticatedCustomer();
  if (!customer || !isAdminEmail(customer.email)) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await request.formData(); const file = formData.get('file');
  if (!(file instanceof File) || !file.type.startsWith('image/')) return Response.json({ error: 'Choose an image file.' }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return Response.json({ error: 'Images must be 10 MB or smaller.' }, { status: 400 });
  const blob = await put(`work-orders/${file.name}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type });
  return Response.json({ url: blob.url });
}

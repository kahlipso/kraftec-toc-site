import Link from 'next/link';
import { createCustomer } from '@/app/admin/actions';

const field = 'mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm';

export default function NewCustomerPage() {
  return (
    <>
      <Link href="/admin/customers" className="text-sm font-semibold text-[#d01111] hover:underline">
        ← All customers
      </Link>
      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#d01111]">Customer history</p>
      <h2 className="mt-2 text-4xl font-bold tracking-tight">New customer</h2>
      <p className="mt-2 text-zinc-500">For logging a phone-in customer before their first request.</p>

      <form action={createCustomer} className="mt-8 max-w-md rounded-2xl border border-gray-200 bg-white p-6">
        <label className="block text-sm font-medium">Full name<input required name="name" className={field} /></label>
        <label className="mt-4 block text-sm font-medium">Phone number<input required name="phone" inputMode="tel" placeholder="(555) 555-1234" className={field} /></label>
        <label className="mt-4 block text-sm font-medium">Email <span className="font-normal text-zinc-400">optional</span><input name="email" type="email" className={field} /></label>
        <button className="mt-6 rounded-full bg-[#d01111] px-6 py-3 text-sm font-semibold text-white">Create customer</button>
      </form>
    </>
  );
}

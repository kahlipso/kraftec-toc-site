import Link from 'next/link';
import { requireAdmin } from '@/app/lib/admin';

const links = [
  ['Overview', '/admin'], ['Requests', '/admin/requests'], ['Work orders', '/admin/work-orders'],
  ['Technicians', '/admin/technicians'], ['Customers', '/admin/customers'], ['Price benchmarks', '/admin/benchmarks'], ['Archive', '/admin/archive'],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f7f7f7] text-black">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:flex-row">
        <aside className="shrink-0 rounded-2xl bg-black p-5 text-white lg:w-56 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">Kraftec</p>
          <h1 className="mt-1 text-xl font-bold">Admin</h1>
          <nav className="mt-8 flex gap-1 overflow-x-auto lg:flex-col">
            {links.map(([label, href]) => <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white">{label}</Link>)}
          </nav>
          <div className="mt-8 border-t border-white/15 pt-4 text-xs text-white/50">Signed in as<br /><span className="text-white/80">{admin.email}</span></div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

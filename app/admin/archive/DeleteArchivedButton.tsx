'use client';

import { useTransition } from 'react';
import { deleteArchivedRecord } from '@/app/admin/actions';

export default function DeleteArchivedButton({ kind, id }: { kind: 'booking' | 'pro' | 'work_order'; id: string }) {
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => { if (window.confirm('Permanently delete this archived record? This cannot be undone.')) startTransition(async () => { await deleteArchivedRecord(kind, id); }); }} className="text-sm font-semibold text-red-700 hover:underline disabled:opacity-50">{pending ? 'Deleting…' : 'Delete forever'}</button>;
}

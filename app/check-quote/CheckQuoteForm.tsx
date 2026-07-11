'use client';

import { useState } from 'react';

const services = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Landscaping',
  'Painting', 'Cleaning', 'Remodeling', 'Handyperson', 'Windows', 'Concrete',
];

type LineItem = { item: string; qty: string; cost: string };

const emptyRow: LineItem = { item: '', qty: '1', cost: '' };

function StepLabel({ n, title, optional }: { n: string; title: string; optional?: boolean }) {
  return (
    <div className="mt-12">
      <p className="text-xs font-semibold text-[#d01111]">{n}</p>
      <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-black">
        {title}
        {optional && <span className="text-sm font-normal text-zinc-400">Optional</span>}
      </h2>
    </div>
  );
}

export default function CheckQuoteForm() {
  const [service, setService] = useState('');
  const [rows, setRows] = useState<LineItem[]>([{ ...emptyRow }, { ...emptyRow }, { ...emptyRow }]);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function updateRow(i: number, field: keyof LineItem, value: string) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { ...emptyRow }]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const total = rows.reduce((sum, r) => {
    const n = parseFloat(r.cost.replace(/[^0-9.]/g, ''));
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit}>
      {/* Step 01 — service */}
      <StepLabel n="01" title="What kind of work?" />
      <p className="mt-1 text-sm text-zinc-500">Pick the closest match — you can add specifics later.</p>
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="mt-4 w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-black focus:border-gray-400 focus:outline-none"
      >
        <option value="">Select a service…</option>
        {services.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Step 02 — line items */}
      <StepLabel n="02" title="Tell us what was quoted" />
      <p className="mt-1 text-sm text-zinc-500">
        Add each line item from the quote. Don&apos;t worry about being exact — you can paste prices as you see them.
      </p>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        {/* header */}
        <div className="grid grid-cols-[1fr_70px_120px] bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          <span className="px-4 py-3">Item</span>
          <span className="px-2 py-3 text-center">Qty</span>
          <span className="px-4 py-3 text-right">Cost</span>
        </div>
        {/* rows */}
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_70px_120px] border-t border-gray-100">
            <input
              value={row.item}
              onChange={(e) => updateRow(i, 'item', e.target.value)}
              placeholder="Item or description…"
              className="bg-transparent px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
            <input
              value={row.qty}
              onChange={(e) => updateRow(i, 'qty', e.target.value)}
              inputMode="numeric"
              className="border-l border-gray-100 bg-transparent px-2 py-3 text-center text-sm text-black focus:outline-none"
            />
            <input
              value={row.cost}
              onChange={(e) => updateRow(i, 'cost', e.target.value)}
              placeholder="$0"
              className="border-l border-gray-100 bg-transparent px-4 py-3 text-right text-sm text-black placeholder:text-gray-400 focus:outline-none"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 text-sm font-semibold text-[#d01111] hover:underline"
      >
        + Add another row
      </button>

      {/* OR divider */}
      <div className="mt-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-zinc-400">OR</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Upload area */}
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-dashed border-gray-300 bg-[#fafafa] px-6 py-5">
        <span className="text-2xl">📄</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-black">Upload a PDF or photo of your quote</p>
          <p className="text-xs text-zinc-500">
            {fileName ? `Selected: ${fileName}` : "We'll extract the line items automatically."}
          </p>
        </div>
        <label className="shrink-0 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-50">
          Choose file
          <input
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
          />
        </label>
      </div>

      {/* Step 03 — notes */}
      <StepLabel n="03" title="Anything else?" optional />
      <p className="mt-1 text-sm text-zinc-500">
        Context that might help — was it after-hours? An emergency? Was the unit really old?
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder={'e.g. "My AC stopped cooling on a 110° day. They called it an emergency call."'}
        className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />

      {/* Submit */}
      <button
        type="submit"
        className="mt-10 w-full rounded-full bg-[#d01111] py-4 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-[0.99]"
      >
        Check my quote →
      </button>

      {/* Submit acknowledgment (placeholder until the result view is built) */}
      {submitted && (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-center">
          <p className="text-sm font-semibold text-green-800">Got it — we&apos;re comparing your quote against verified jobs near you.</p>
          <p className="mt-1 text-xs text-green-700">
            {total > 0 ? `Quoted total: $${total.toLocaleString()}. ` : ''}
            The full fair-range result view is coming next.
          </p>
        </div>
      )}
    </form>
  );
}

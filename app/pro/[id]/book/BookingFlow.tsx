'use client';

import { useState } from 'react';
import Link from 'next/link';
import { APIProvider } from '@vis.gl/react-google-maps';
import { usePlacesAutocomplete } from '@/app/lib/finder/usePlacesAutocomplete';
import { submitBooking } from './actions';
import type { DayColumn, SlotCell } from '@/app/types/booking';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

type Step = 'time' | 'details' | 'done';

// Service-address input with Places autocomplete. Unlike find-pro (which needs
// coordinates), booking only needs address TEXT — so free typing stays valid and
// suggestions are a convenience. Both typing and picking update the parent.
function AddressField({ onChange }: { onChange: (value: string) => void }) {
  const { containerRef, value, setValue, suggestions, open, setOpen, choose } =
    usePlacesAutocomplete((_loc, label) => onChange(label));

  return (
    <div ref={containerRef} className="relative">
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
        placeholder="123 Maple St, Irvine, CA"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => choose(s)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-zinc-700 hover:bg-gray-50"
              >
                <svg className="size-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const steps = [
  { n: '✓', label: 'Pro selected' },
  { n: '2', label: 'Pick a time' },
  { n: '3', label: 'Your details' },
  { n: '4', label: 'Confirm' },
];

function StepBar({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= active ? 'bg-[#d01111] text-white' : 'border border-gray-300 bg-white text-zinc-400'
              }`}
            >
              {step.n}
            </span>
            <span className={`text-[11px] ${i <= active ? 'font-medium text-black' : 'text-zinc-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && <span className="mb-5 h-px w-16 bg-gray-200 sm:w-24" />}
        </div>
      ))}
    </div>
  );
}

export default function BookingFlow({
  proId,
  proName,
  proInitials,
  contactName,
  availability,
}: {
  proId: string;
  proName: string;
  proInitials: string;
  contactName: string;
  availability: DayColumn[];
}) {
  const [step, setStep] = useState<Step>('time');
  const [selected, setSelected] = useState<{ slot: SlotCell; day: string } | null>(null);
  // Locally-learned taken slots (e.g. we lost a race) layered over the server grid.
  const [takenIsos, setTakenIsos] = useState<Set<string>>(new Set());

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [welcomeBack, setWelcomeBack] = useState(false);

  const activeIndex = step === 'time' ? 1 : step === 'details' ? 2 : 3;
  const detailsComplete = name.trim() && phone.trim() && address.trim();

  async function handleConfirm() {
    if (!selected || pending) return;
    setPending(true);
    setErrorMsg(null);

    const result = await submitBooking({
      proId,
      slotIso: selected.slot.iso,
      name,
      phone,
      address,
      description,
    });
    setPending(false);

    if (result.ok) {
      setWelcomeBack(result.welcomeBack);
      setStep('done');
      return;
    }
    if (result.error === 'slot_taken') {
      // Lost the race: mark the cell taken and send them back to the grid.
      setTakenIsos((prev) => new Set(prev).add(selected.slot.iso));
      setSelected(null);
      setStep('time');
      setErrorMsg('That slot was just booked by someone else — please pick another.');
    } else if (result.error === 'invalid_phone') {
      setErrorMsg('That phone number doesn’t look right — use a 10-digit US number.');
    } else if (result.error === 'missing_fields') {
      setErrorMsg('Please fill in your name and address.');
    } else {
      setErrorMsg('Something went wrong — please re-select your time slot.');
      setStep('time');
    }
  }

  const content = (
    <div>
      <StepBar active={activeIndex} />

      {/* ---------- Step 2: pick a time ---------- */}
      {step === 'time' && (
        <div className="mt-10">
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
              <span className="size-2 rounded-full bg-[#d01111]" />
              Pick your time
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
              When works for you?
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Select an open inspection slot with {proName} — a quick look at the problem, usually 45–60 min.
            </p>
          </div>

          {errorMsg && (
            <p className="mx-auto mt-6 max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              {errorMsg}
            </p>
          )}

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {availability.map((day) => (
              <div key={day.label}>
                <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {day.label}
                </p>
                <div className="flex flex-col gap-2">
                  {day.slots.map((slot) => {
                    const taken = slot.taken || takenIsos.has(slot.iso);
                    const isSelected = selected?.slot.iso === slot.iso;
                    return (
                      <button
                        key={slot.iso}
                        type="button"
                        disabled={taken}
                        onClick={() => setSelected({ slot, day: day.label })}
                        className={`rounded-xl border py-2.5 text-center text-sm transition ${
                          taken
                            ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-zinc-300'
                            : isSelected
                              ? 'border-[#d01111] bg-[#d01111]/5 font-semibold text-[#d01111]'
                              : 'border-gray-200 bg-white text-black hover:border-gray-300'
                        }`}
                      >
                        {taken ? (
                          'Taken'
                        ) : (
                          <>
                            {slot.label}
                            <span className={`block text-[10px] font-medium ${isSelected ? 'text-[#d01111]' : 'text-green-600'}`}>
                              {isSelected ? 'Selected ✓' : 'Open'}
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={!selected}
              onClick={() => setStep('details')}
              className="rounded-full bg-[#d01111] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue{selected ? ` with ${selected.day} · ${selected.slot.label}` : ''} →
            </button>
          </div>
        </div>
      )}

      {/* ---------- Step 3: your details ---------- */}
      {step === 'details' && selected && (
        <div className="mx-auto mt-10 max-w-lg">
          <div className="text-center">
            <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#d01111]">
              <span className="size-2 rounded-full bg-[#d01111]" />
              Your details
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-black">Almost there.</h1>
            <p className="mt-2 text-sm text-zinc-500">
              {selected.day} · {selected.slot.label} with {proName}
            </p>
          </div>

          {errorMsg && (
            <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
              {errorMsg}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-black">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder="Jane Smith"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-black">Phone number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder="(949) 555-1234"
              />
              <span className="mt-1 block text-xs text-zinc-400">
                By booking, you agree to receive a text confirming your appointment and updates
                about it. Msg &amp; data rates may apply. Reply STOP to opt out. We never sell your
                number.
              </span>
            </label>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-black">Service address</span>
              {apiKey ? (
                <AddressField onChange={setAddress} />
              ) : (
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                  placeholder="123 Maple St, Irvine, CA"
                />
              )}
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-black">
                What do you need help with? <span className="font-normal text-zinc-400">Optional</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
                placeholder='e.g. "AC not cooling — unit runs but blows warm air."'
              />
            </label>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => { setStep('time'); setErrorMsg(null); }}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-black transition hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              type="button"
              disabled={!detailsComplete || pending}
              onClick={handleConfirm}
              className="rounded-full bg-[#d01111] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#d01111]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? 'Booking…' : 'Confirm booking →'}
            </button>
          </div>
        </div>
      )}

      {/* ---------- Step 4: confirmation ---------- */}
      {step === 'done' && selected && (
        <div className="mx-auto mt-14 max-w-lg text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-500 text-3xl text-white">
            ✓
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-black">Request received.</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">
            You&apos;re set for <span className="font-semibold text-black">{selected.day} · {selected.slot.label}</span> with{' '}
            <span className="font-semibold text-black">{proName}</span>. We&apos;ll text you shortly to confirm —
            then {contactName.split(' ')[0]} will give you a call before the inspection.
          </p>
          {welcomeBack && (
            <p className="mt-3 text-sm text-zinc-500">
              Welcome back — we&apos;ve linked this booking to your previous visits.
            </p>
          )}

          <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
            <span className="flex size-10 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
              {proInitials}
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-black">{proName}</p>
              <p className="text-xs text-zinc-500">Inspection · 45–60 min</p>
            </div>
          </div>

          <Link href="/" className="mt-8 inline-block text-sm font-semibold text-[#d01111] hover:underline">
            ← Back to home
          </Link>
        </div>
      )}
    </div>
  );

  // The autocomplete hook needs the Maps JS context; without a key the plain
  // input fallback renders and everything else still works.
  return apiKey ? <APIProvider apiKey={apiKey}>{content}</APIProvider> : content;
}

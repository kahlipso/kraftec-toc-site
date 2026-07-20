'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import type { AuthenticatedCustomer } from '@/app/lib/auth';
import { login, register } from '@/app/auth/actions';

export type AuthModalStage = 'phone' | 'login' | 'register' | null;

function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-zinc-500 hover:bg-gray-100 hover:text-black">&#215;</button>
        {children}
      </div>
    </div>
  );
}

export default function AuthModals({
  stage,
  onClose,
  onStageChange,
  onAuthenticated,
  booking,
}: {
  stage: AuthModalStage;
  onClose: () => void;
  onStageChange: (stage: Exclude<AuthModalStage, null>) => void;
  onAuthenticated: (customer: AuthenticatedCustomer) => void;
  booking?: boolean;
}) {
  const [phone, setPhone] = useState('');
  const [lookupPending, setLookupPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);

  if (!stage) return null;

  async function checkPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLookupPending(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/check-phone', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
      const data = (await response.json()) as { exists?: boolean; error?: string };
      if (!response.ok || typeof data.exists !== 'boolean') { setError(data.error ?? 'We could not check that phone number.'); return; }
      onStageChange(data.exists ? 'login' : 'register');
    } catch {
      setError('We could not check that phone number. Please try again.');
    } finally {
      setLookupPending(false);
    }
  }

  if (stage === 'phone') return (
    <Modal onClose={onClose}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">{booking ? 'One last step' : 'Welcome to Kraftec'}</p>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-black">{booking ? 'Save your time.' : 'Log in or create an account.'}</h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-500">Enter your phone number to continue. We never sell it.</p>
      <form className="mt-6" onSubmit={checkPhone}>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-black">Phone number</span><input autoFocus required value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" placeholder="(949) 555-1234" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black focus:border-gray-400 focus:outline-none" /></label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button disabled={lookupPending} className="mt-5 w-full rounded-full bg-[#d01111] py-3 text-sm font-semibold text-white disabled:opacity-60">{lookupPending ? 'Checking…' : 'Continue'}</button>
      </form>
    </Modal>
  );

  if (stage === 'login') return <LoginModal phone={phone} onClose={onClose} onAuthenticated={onAuthenticated} pending={loginPending} setPending={setLoginPending} booking={booking} />;
  return <RegistrationModal phone={phone} onClose={onClose} onAuthenticated={onAuthenticated} pending={registerPending} setPending={setRegisterPending} booking={booking} />;
}

function LoginModal({ phone, onClose, onAuthenticated, pending, setPending, booking }: { phone: string; onClose: () => void; onAuthenticated: (customer: AuthenticatedCustomer) => void; pending: boolean; setPending: (value: boolean) => void; booking?: boolean }) {
  const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(null); const result = await login(phone, password); setPending(false); if (result.ok) onAuthenticated(result.customer); else setError(result.error); }
  return <Modal onClose={onClose}><p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">Welcome back</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-black">{booking ? 'Log in to finish booking.' : 'Log in to your account.'}</h2><p className="mt-2 text-sm text-zinc-500">{phone}</p><form className="mt-6" onSubmit={submit}><label className="block"><span className="mb-1.5 block text-sm font-medium text-black">Password</span><input autoFocus required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black focus:border-gray-400 focus:outline-none" /></label>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<button disabled={pending} className="mt-5 w-full rounded-full bg-[#d01111] py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Logging in…' : booking ? 'Log in and continue' : 'Log in'}</button></form></Modal>;
}

function RegistrationModal({ phone, onClose, onAuthenticated, pending, setPending, booking }: { phone: string; onClose: () => void; onAuthenticated: (customer: AuthenticatedCustomer) => void; pending: boolean; setPending: (value: boolean) => void; booking?: boolean }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(null); const result = await register({ phone, name, email, password }); setPending(false); if (result.ok) onAuthenticated(result.customer); else setError(result.error); }
  return <Modal onClose={onClose}><p className="text-xs font-semibold uppercase tracking-widest text-[#d01111]">New to Kraftec</p><h2 className="mt-3 text-2xl font-bold tracking-tight text-black">Create your account.</h2><p className="mt-2 text-sm text-zinc-500">{booking ? 'Your account is created as part of this booking.' : 'It only takes a minute.'}</p><form className="mt-6 flex flex-col gap-4" onSubmit={submit}><label><span className="mb-1.5 block text-sm font-medium text-black">Full name</span><input autoFocus required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black focus:border-gray-400 focus:outline-none" /></label><label><span className="mb-1.5 block text-sm font-medium text-black">Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black focus:border-gray-400 focus:outline-none" /></label><label><span className="mb-1.5 block text-sm font-medium text-black">Password</span><input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black focus:border-gray-400 focus:outline-none" /><span className="mt-1 block text-xs text-zinc-400">At least 8 characters.</span></label>{error && <p className="text-sm text-red-700">{error}</p>}<button disabled={pending} className="rounded-full bg-[#d01111] py-3 text-sm font-semibold text-white disabled:opacity-60">{pending ? 'Creating account…' : booking ? 'Create account and continue' : 'Create account'}</button></form></Modal>;
}

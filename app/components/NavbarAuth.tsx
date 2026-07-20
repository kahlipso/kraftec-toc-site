'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthModals, { type AuthModalStage } from './AuthModals';

export default function NavbarAuth() {
  const [stage, setStage] = useState<AuthModalStage>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((response) => response.ok ? response.json() : null)
      .then((data: { customer?: { name?: string } } | null) => {
        if (data?.customer?.name) setName(data.customer.name);
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      {name ? (
        <Link href="/profile" className="btn hover:text-black/50 active:scale-95">Hi, {name.split(' ')[0]}</Link>
      ) : (
        <button type="button" onClick={() => setStage('phone')} className="btn hover:text-black/50 active:scale-95">Login</button>
      )}
      <AuthModals
        stage={stage}
        onClose={() => setStage(null)}
        onStageChange={setStage}
        onAuthenticated={(customer) => { setName(customer.name); setStage(null); }}
      />
    </>
  );
}

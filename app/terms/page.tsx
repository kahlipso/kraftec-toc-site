export const metadata = { title: 'Terms of Service — Kraftec' };

export default function Page() {
  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-3xl px-6 pt-12">
        <h1 className="text-3xl font-bold tracking-tight text-black">Terms of Service</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: July 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">1. The service</h2>
            <p>
              Kraftec is a platform that helps homeowners compare quotes, find verified home
              service professionals, and book appointments. Kraftec connects you with independent
              service professionals; the professionals — not Kraftec — perform the work and are
              responsible for their services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">2. Bookings</h2>
            <p>
              Submitting a booking request is a request for an appointment, not a guarantee of
              service. Your booking is confirmed when we notify you by text message. You agree to
              provide accurate contact and address information so the service professional can
              reach you and perform the work.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">3. Text messaging terms</h2>
            <p>
              By providing your phone number during booking, you agree to receive booking-related
              text messages from Kraftec (confirmations, reminders, scheduling updates, and
              cancellation notices).
            </p>
            <ul className="mt-3 list-disc pl-5">
              <li>Message frequency varies — typically 1–4 messages per booking.</li>
              <li>Message and data rates may apply.</li>
              <li>
                Reply <strong>STOP</strong> to cancel at any time. Reply <strong>HELP</strong> for
                help, or contact info@mykraftec.com.
              </li>
              <li>
                Carriers are not liable for delayed or undelivered messages. Consent to receive
                text messages is not a condition of purchasing any service.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">4. Acceptable use</h2>
            <p>
              You agree to use Kraftec only for lawful purposes, to provide truthful information,
              and not to interfere with the operation of the service.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">5. Disclaimers</h2>
            <p>
              The service is provided &quot;as is.&quot; While we verify professionals&apos;
              licensing and credentials as described on the site, Kraftec does not warrant the
              outcome of any work performed by independent professionals. Nothing on this site is
              a binding price guarantee; quotes and price ranges are estimates.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">6. Contact</h2>
            <p>
              Kraftec · 2961 Medinah Ct., Atlanta, GA 30341 · info@mykraftec.com · 678-666-0040
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export const metadata = { title: 'Privacy Policy — Kraftec' };

export default function Page() {
  return (
    <div className="bg-white pb-20">
      <div className="mx-auto max-w-3xl px-6 pt-12">
        <h1 className="text-3xl font-bold tracking-tight text-black">Privacy Policy</h1>
        <p className="mt-2 text-sm text-zinc-400">Last updated: July 2026</p>

        <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-zinc-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">Information we collect</h2>
            <p>
              When you use Kraftec to check a quote, find a service professional, or book an
              appointment, we collect the information you provide: your name, phone number,
              service address, and a description of the work you need. We use this information
              solely to operate the service — matching you with a professional, scheduling your
              appointment, and communicating with you about it.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">SMS / text messaging</h2>
            <p>
              By providing your phone number when booking an appointment, you consent to receive
              text messages from Kraftec related to your booking, such as booking confirmations,
              appointment reminders, scheduling updates, and cancellation notices.
            </p>
            <ul className="mt-3 list-disc pl-5">
              <li>
                <strong>No mobile information sharing:</strong> No mobile information will be
                shared with third parties or affiliates for marketing or promotional purposes.
                Text messaging originator opt-in data and consent will not be shared with any
                third parties.
              </li>
              <li>
                <strong>Message frequency</strong> varies based on your booking activity —
                typically 1–4 messages per booking.
              </li>
              <li>
                <strong>Message and data rates may apply.</strong>
              </li>
              <li>
                <strong>Opt out</strong> at any time by replying <strong>STOP</strong> to any
                message. Reply <strong>HELP</strong> for help, or contact us at
                info@mykraftec.com.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">How we share information</h2>
            <p>
              Your contact information is shared only with the service professional you choose to
              book, and only after you confirm your booking — so they can contact you about your
              appointment. We do not sell your personal information, and we do not share it with
              third parties for their marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">Data retention &amp; your choices</h2>
            <p>
              We retain booking records to operate the service, maintain your home&apos;s service
              history, and meet legal obligations. You may request access to or deletion of your
              personal information by contacting us at info@mykraftec.com.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-black">Contact</h2>
            <p>
              Kraftec · 2961 Medinah Ct., Atlanta, GA 30341 · info@mykraftec.com · 678-666-0040
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

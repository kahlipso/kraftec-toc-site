import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700']
});

const leadGenItems = [
  "Your phone number is sold to 3–4 contractors who all call",
  "No fair-price answer — exposing prices would kill their revenue",
  "Star ratings averaged across everything — and gameable",
  "Forgets you exist the moment the lead is sold",
  "Earns whether you're happy or not",
];

const kraftecItems = [
  "You stay anonymous while using the free tools — no spam calls",
  "Every quote rated against verified jobs in your area",
  "Each verification dated and refreshed monthly",
  "6 and 12 month follow-ups so the fix actually has to hold up",
  "We earn only when a real, fairly-priced job books",
];

const othersFlow = [
  "Homeowner asks for help (free, but their info gets sold)",
  "The same lead is sold to 3–4 contractors",
  "Contractors pay $15–$100 per lead — win or lose",
  "The company earns whether the homeowner is happy or not",
];

const kraftecFlow = [
  "Homeowner checks their quote (free, info stays private)",
  "If the quote looks high, we connect 1–2 honest pros",
  "The pro is matched directly to you",
  "We earn only on real, fairly-priced outcomes",
];

export default function Page() {
  return (
    <div className="flex flex-col items-center font-sans bg-white">
      <main className="w-full max-w-4xl mx-auto px-10 py-20 flex flex-col gap-16" style={{ animation: "floatUp 1s ease-out" }}>

        {/* Hero */}
        <section className="">
          <h1 className={`${inter.className} text-6xl font-medium tracking-tight text-black leading-tight`}>
            Others work for contractors.<br />
            We work for <i><b>YOU</b></i>.
          </h1>
        </section>

        {/* Comparison */}
        <section className="rounded-2xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row">
          <div className="flex-1 p-8 bg-white">
            <h2 className={`${inter.className} text-lg font-medium text-black mb-6`}>
              The lead-gen model
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside">
              {leadGenItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          <div className="flex-1 p-8 bg-[#D01111]/35">
            <h2 className={`${inter.className} text-lg font-medium text-black mb-6`}>
              Kraftec
            </h2>
            <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside">
              {kraftecItems.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </section>

        {/* Follow the money */}
        <section className="flex flex-col gap-6">
          <h2 className={`${inter.className} text-3xl font-medium text-black`}>
            Follow the money
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
              <h3 className={`${inter.className} text-sm font-medium text-black`}>
                How others make money
              </h3>
              {othersFlow.map((item, i) => (
                <p key={i} className="text-sm text-gray-600">→ {item}</p>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
              <h3 className={`${inter.className} text-sm font-medium text-black`}>
                How we make money
              </h3>
              {kraftecFlow.map((item, i) => (
                <p key={i} className="text-sm text-gray-600">→ {item}</p>
              ))}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
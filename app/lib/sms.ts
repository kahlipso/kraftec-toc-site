// SMS sending via Twilio's REST API (one authenticated POST — no SDK needed).
// Server-only: reads TWILIO_* env vars, which must never be NEXT_PUBLIC_.
//
// Unconfigured (no env vars) it logs what it WOULD send and reports false —
// so booking works in every environment and texting lights up when the
// credentials are added (same pattern as the Maps key).

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!accountSid || !authToken || !fromNumber) {
    console.log(`[sms] not configured — would send to ${to}: "${body}"`);
    return false;
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
      },
    );
    if (!res.ok) {
      console.error('[sms] send failed:', res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error('[sms] send error:', err);
    return false;
  }
}

/** "2026-07-16T10:00" → "Thu, Jul 16 at 10:00 AM" for the confirmation text. */
export function formatSlotForSms(slotIso: string): string {
  const d = new Date(slotIso);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let h = d.getHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()} at ${h}:${mins} ${ampm}`;
}

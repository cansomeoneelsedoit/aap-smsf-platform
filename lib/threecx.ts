/**
 * 3CX Web Client integration.
 *
 * Calls are initiated via the 3CX Web Client's dial deep link, which opens
 * the staff member's 3CX web client with the number pre-dialled. Requires
 * NEXT_PUBLIC_THREECX_WEBCLIENT_URL (e.g. "https://yourpbx.3cx.com.au").
 */

/** Normalises an Australian phone number for dialling (strips formatting). */
export function normalisePhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  // Convert +61 4xx... to local 04xx... form, which the PBX expects
  if (cleaned.startsWith("+61")) {
    return `0${cleaned.slice(3)}`;
  }
  return cleaned;
}

export function buildCallUrl(phone: string): string | null {
  const base = process.env.NEXT_PUBLIC_THREECX_WEBCLIENT_URL;
  if (!base) return null;

  const number = normalisePhoneNumber(phone);
  if (!number) return null;

  return `${base.replace(/\/$/, "")}/webclient/#/call?phone=${encodeURIComponent(number)}`;
}

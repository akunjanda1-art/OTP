/**
 * Normalize Indonesian / international phone numbers to E.164-ish format
 * without the + prefix (e.g. 6281234567890). PRD §11.1 rule #8.
 */
export function normalizePhone(input: string): string {
  let phone = input.replace(/[\s\-()]/g, "").trim();
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("00")) phone = phone.slice(2);
  if (phone.startsWith("0")) phone = "62" + phone.slice(1);
  return phone;
}

export function isValidPhone(phone: string): boolean {
  return /^[1-9]\d{7,14}$/.test(phone);
}

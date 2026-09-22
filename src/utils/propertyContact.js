export function extractContactPhones(value) {
  return (value ?? "").match(/\+?\d[\d \t().-]{5,}\d/g)?.map((phone) => phone.trim()).join("\n") ?? "";
}

export const DEFAULT_PROPERTY_CONTACTS = ["+38345465726", "+38348465726"];

const phoneKey = (phone) => phone.replace(/\D/g, "");

export function formatPropertyPhone(phone) {
  const digits = phoneKey(phone);
  if (digits.startsWith("383") && digits.length === 11) {
    return `+383 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  return phone.trim();
}

export function withDefaultPropertyContacts(value = "") {
  const phones = extractContactPhones(value).split("\n").filter(Boolean);
  const seen = new Set(phones.map(phoneKey));
  DEFAULT_PROPERTY_CONTACTS.forEach((phone) => {
    const key = phoneKey(phone);
    if (!seen.has(key)) {
      phones.push(phone);
      seen.add(key);
    }
  });
  return phones.join("\n");
}

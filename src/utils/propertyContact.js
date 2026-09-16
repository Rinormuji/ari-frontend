export function extractContactPhones(value) {
  return (value ?? "").match(/\+?\d[\d \t().-]{5,}\d/g)?.map((phone) => phone.trim()).join("\n") ?? "";
}

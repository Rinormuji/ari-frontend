export const PRICE_TYPES = {
  TOTAL: "TOTAL",
  PER_M2: "PER_M2",
  NEGOTIABLE: "NEGOTIABLE",
};

export const formatPropertyPrice = (property) => {
  if (!property || property.priceType === PRICE_TYPES.NEGOTIABLE) {
    return "Me marrëveshje";
  }

  const price = Number(property.price);
  if (!Number.isFinite(price) || price <= 0) {
    return "Me marrëveshje";
  }

  const formatted = `${price.toLocaleString()} €`;
  return property.priceType === PRICE_TYPES.PER_M2 ? `${formatted}/m²` : formatted;
};

export const formatCalculatedTotal = (property) => {
  if (!property || property.priceType !== PRICE_TYPES.PER_M2) return "";

  const price = Number(property.price);
  const area = Number(property.area);
  if (!Number.isFinite(price) || !Number.isFinite(area) || price <= 0 || area <= 0) {
    return "";
  }

  return `${(price * area).toLocaleString()} € total`;
};

export const typeLabels = {
  BANESA: "Banesë",
  SHTEPI: "Shtëpi",
  LOKALE: "Lokal",
  TOKA: "Tokë",
};

export const statusLabels = {
  FOR_SALE: "Në shitje",
  FOR_RENT: "Me qira",
};

export const getTypeLabel = (type) => typeLabels[type] || type || "";
export const getStatusLabel = (status) => statusLabels[status] || status || "";

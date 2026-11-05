import { propertyTypes } from "./propertyDetails";

export const typeLabels = propertyTypes;

export const statusLabels = {
  FOR_SALE: "Në shitje",
  FOR_RENT: "Me qira",
  SOLD: "E shitur",
  RENTED: "E lëshuar me qera",
};

export const getTypeLabel = (type) => typeLabels[type] || type || "";
export const getStatusLabel = (status) => statusLabels[status] || status || "";
export const isPropertyUnavailable = (property) => ["SOLD", "RENTED"].includes(property?.status);

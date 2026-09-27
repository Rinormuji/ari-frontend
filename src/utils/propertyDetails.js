export const propertyTypes = {
  SHTEPI: "Shtëpi",
  BANESA: "Banesë",
  TOKA: "Tokë",
  LOKALE: "Lokal",
  ZYRE: "Zyrë",
  DEPO: "Depo",
  OBJEKT: "Objekt",
  VILLE: "Vilë",
  INVENTAR: "Inventar",
};

const utilities = [
  { key: "hasElectricity", label: "Rrymë", kind: "boolean" },
  { key: "hasWater", label: "Ujë", kind: "boolean" },
  { key: "hasSewerage", label: "Kanalizim", kind: "boolean" },
];

const residential = [
  { key: "furnishing", label: "Mobilimi", kind: "select", options: ["E mobiluar", "E pamobiluar"] },
  { key: "livingRooms", label: "Sallon", kind: "number" },
  { key: "kitchens", label: "Kuzhinë", kind: "number" },
  { key: "hasStorage", label: "Depo", kind: "boolean" },
  { key: "hasNotary", label: "Noter", kind: "boolean" },
  { key: "hasLawyer", label: "Avokat", kind: "boolean" },
];

export const detailFieldsByType = {
  SHTEPI: [
    ...utilities, ...residential,
    { key: "occupancy", label: "Banimi", kind: "select", options: ["E banuar", "E pabanuar"] },
    { key: "hasParking", label: "Parking", kind: "boolean" },
  ],
  BANESA: [
    { key: "complex", label: "Kompleksi", kind: "text", placeholder: "p.sh. Kompleksi Fidanishtja" },
    ...residential,
    { key: "hasGarage", label: "Garazh", kind: "boolean" },
  ],
  TOKA: [
    ...utilities,
    { key: "isForest", label: "Mal", kind: "boolean" },
    { key: "isFlat", label: "Tokë e rrafshët", kind: "boolean" },
    { key: "isFertile", label: "Tokë pjellore", kind: "boolean" },
  ],
  LOKALE: [
    ...utilities,
    { key: "complex", label: "Kompleksi", kind: "text", placeholder: "Kompleksi ku gjendet" },
  ],
};

export const getDetailFields = (type) => detailFieldsByType[type] || [];

export const getVisibleDetails = (property) =>
  getDetailFields(property?.type).flatMap(({ key, label, kind }) => {
    const value = property?.details?.[key];
    if (value === undefined || value === null || value === "" || (kind === "boolean" && !value)) return [];
    return [{ label, value: kind === "boolean" ? "Po" : String(value) }];
  });

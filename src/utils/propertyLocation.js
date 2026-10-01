const VILLAGE_PREFIX = /^fshati\s+/i;

export const parsePropertyLocation = (property) => {
  const raw = String(property?.location || property?.city || "").trim();
  const [city = "", ...remaining] = raw.split(",");
  const secondary = remaining.join(",").trim();
  const isVillage = VILLAGE_PREFIX.test(secondary);

  return {
    city: city.trim(),
    area: isVillage ? secondary.replace(VILLAGE_PREFIX, "").trim() : secondary,
    areaType: isVillage ? "village" : "neighborhood",
  };
};

export const formatPropertyLocation = (property) => {
  const { city, area } = parsePropertyLocation(property);
  return [city, area].filter(Boolean).join(", ") || "Kosovë";
};

export const buildPropertyLocation = (city, area, areaType) => {
  const cleanCity = String(city || "").trim();
  const enteredArea = String(area || "").trim();
  const cleanArea = areaType === "village" ? enteredArea.replace(VILLAGE_PREFIX, "").trim() : enteredArea;
  if (!cleanArea) return cleanCity;
  return `${cleanCity}${cleanCity ? ", " : ""}${areaType === "village" ? "Fshati " : ""}${cleanArea}`;
};

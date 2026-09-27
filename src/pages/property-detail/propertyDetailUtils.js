import { configureLeafletIcons as applyLeafletIconConfig } from "../../utils/leafletIcons";
import { getStatusLabel } from "../../utils/propertyLabels";
import { getVisibleDetails } from "../../utils/propertyDetails";

export const placeholderImage = "/placeholder.jpg";

export const configureLeafletIcons = applyLeafletIconConfig;

export const getPropertyImages = (property) =>
  property?.images?.length ? property.images : [placeholderImage];

const getCoordinates = (property) => {
  const latitude = String(property?.latitude ?? "").trim();
  const longitude = String(property?.longitude ?? "").trim();
  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!latitude || !longitude || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude, longitude };
};

export const hasMapPosition = (property) => getCoordinates(property) !== null;

export const getGoogleMapsUrl = (property) => {
  const coordinates = getCoordinates(property);
  if (!coordinates) return null;

  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", `${coordinates.latitude},${coordinates.longitude}`);
  return url.toString();
};

export const buildPropertyFeatures = (property) => {
  if (!property) return [];

  const features = [];
  const add = (condition, label, value) => {
    if (condition) features.push({ label, value });
  };

  add(property.area, "Sipërfaqja", `${property.area} m²`);
  add(property.status, "Statusi", getStatusLabel(property.status));

  if (property.type === "BANESA") {
    const bedrooms = Number(property.details?.bedrooms) > 0 ? property.details.bedrooms : property.rooms;
    const bathrooms = Number(property.bathrooms) > 0 ? property.bathrooms : (property.details?.toilets ?? property.bathrooms);
    add(Number(bedrooms) > 0, "Dhoma gjumi", bedrooms);
    add(Number(bathrooms) > 0, "Banjo", bathrooms);
    add(property.floor !== null && property.floor !== undefined, "Kati", property.floor);
    add(property.hasElevator !== null && property.hasElevator !== undefined, "Ashensor", property.hasElevator ? "Po" : "Jo");
    add(property.hasBalcony !== null && property.hasBalcony !== undefined, "Ballkon", property.hasBalcony ? "Po" : "Jo");
  }

  if (property.type === "SHTEPI") {
    const bedrooms = Number(property.details?.bedrooms) > 0 ? property.details.bedrooms : property.rooms;
    const bathrooms = Number(property.bathrooms) > 0 ? property.bathrooms : (property.details?.toilets ?? property.bathrooms);
    add(Number(bedrooms) > 0, "Dhoma gjumi", bedrooms);
    add(property.floors || property.floor, "Kate", property.floors || property.floor);
    add(property.hasGarden !== null && property.hasGarden !== undefined, "Kopsht", property.hasGarden ? "Po" : "Jo");
    add(property.hasGarage !== null && property.hasGarage !== undefined, "Garazh", property.hasGarage ? "Po" : "Jo");
    add(Number(bathrooms) > 0, "Banjo", bathrooms);
  }

  if (property.type === "LOKALE") {
    add(property.floor !== null && property.floor !== undefined, "Kati", property.floor);
    add(property.hasParking !== null && property.hasParking !== undefined, "Parking", property.hasParking ? "Po" : "Jo");
  }

  if (property.type === "TOKA") {
    add(
      property.hasInfrastructure !== null && property.hasInfrastructure !== undefined,
      "Infrastrukturë",
      property.hasInfrastructure ? "Po" : "Jo",
    );
  }

  return [...features, ...getVisibleDetails(property)];
};

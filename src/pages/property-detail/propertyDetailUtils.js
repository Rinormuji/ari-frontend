import L from "leaflet";
import { getStatusLabel } from "../../utils/propertyLabels";

export const placeholderImage = "/placeholder.jpg";

export const configureLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

export const getPropertyImages = (property) =>
  property?.images?.length ? property.images : [placeholderImage];

export const hasMapPosition = (property) =>
  property?.latitude != null && property?.longitude != null;

export const buildPropertyFeatures = (property) => {
  if (!property) return [];

  const features = [];
  const add = (condition, label, value) => {
    if (condition) features.push({ label, value });
  };

  add(property.area, "Sipërfaqja", `${property.area} m²`);
  add(property.status, "Statusi", getStatusLabel(property.status));

  if (property.type === "BANESA") {
    add(property.rooms, "Dhomat", property.rooms);
    add(property.bathrooms, "Banjot", property.bathrooms);
    add(property.floor, "Kati", property.floor);
    add(property.hasElevator !== null && property.hasElevator !== undefined, "Ashensor", property.hasElevator ? "Po" : "Jo");
    add(property.hasBalcony !== null && property.hasBalcony !== undefined, "Ballkon", property.hasBalcony ? "Po" : "Jo");
  }

  if (property.type === "SHTEPI") {
    add(property.floors || property.floor, "Kate", property.floors || property.floor);
    add(property.hasGarden !== null && property.hasGarden !== undefined, "Kopsht", property.hasGarden ? "Po" : "Jo");
    add(property.hasGarage !== null && property.hasGarage !== undefined, "Garazh", property.hasGarage ? "Po" : "Jo");
    add(property.bathrooms, "Banjot", property.bathrooms);
  }

  if (property.type === "LOKALE") {
    add(property.floor, "Kati", property.floor);
    add(property.hasParking !== null && property.hasParking !== undefined, "Parking", property.hasParking ? "Po" : "Jo");
  }

  if (property.type === "TOKA") {
    add(
      property.hasInfrastructure !== null && property.hasInfrastructure !== undefined,
      "Infrastrukturë",
      property.hasInfrastructure ? "Po" : "Jo",
    );
  }

  return features;
};

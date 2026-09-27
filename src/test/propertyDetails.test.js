import { describe, expect, it } from "vitest";
import { getDetailFields, getVisibleDetails, propertyTypes } from "../utils/propertyDetails";
import { buildPropertyFeatures } from "../pages/property-detail/propertyDetailUtils";

describe("property details", () => {
  it("includes all requested types and dedicated fields", () => {
    expect(Object.keys(propertyTypes)).toEqual(["SHTEPI", "BANESA", "TOKA", "LOKALE", "ZYRE", "DEPO", "OBJEKT", "VILLE", "INVENTAR"]);
    expect(getDetailFields("BANESA").some((field) => field.key === "complex")).toBe(true);
    expect(getDetailFields("TOKA").some((field) => field.key === "isFertile")).toBe(true);
  });

  it("shows saved values and skips unset flags", () => {
    expect(getVisibleDetails({ type: "SHTEPI", details: { bedrooms: 3, hasElectricity: true, hasWater: false } }))
      .toEqual([{ label: "Rrymë", value: "Po" }]);
  });

  it("merges legacy room and WC data into one bedroom and bathroom entry", () => {
    const features = buildPropertyFeatures({
      type: "BANESA", rooms: 2, bathrooms: 1,
      details: { bedrooms: 1, toilets: 2, livingRooms: 1, kitchens: 1 },
    });
    expect(features.filter(({ label }) => label === "Dhoma gjumi")).toEqual([{ label: "Dhoma gjumi", value: 1 }]);
    expect(features.filter(({ label }) => label === "Banjo")).toEqual([{ label: "Banjo", value: 1 }]);
    expect(features.map(({ label }) => label)).not.toContain("WC");
    expect(features.map(({ label }) => label)).toContain("Sallon");
    expect(features.map(({ label }) => label)).toContain("Kuzhinë");

    const legacyOnly = buildPropertyFeatures({ type: "BANESA", bathrooms: 0, details: { toilets: 2 } });
    expect(legacyOnly.filter(({ label }) => label === "Banjo")).toEqual([{ label: "Banjo", value: 2 }]);
  });

  it("orders apartment details from location and size to rooms and amenities", () => {
    const features = buildPropertyFeatures({
      type: "BANESA", area: 80, status: "FOR_SALE", floor: 3, rooms: 2, bathrooms: 1,
      details: { complex: "Fidanishtja", livingRooms: 1, furnishing: "E mobiluar" },
    });
    expect(features.map(({ label }) => label)).toEqual([
      "Kompleksi", "Sipërfaqja", "Statusi", "Kati", "Dhoma gjumi", "Banjo", "Sallon", "Mobilimi",
    ]);
  });
});

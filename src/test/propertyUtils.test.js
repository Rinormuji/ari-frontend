import { describe, expect, it } from "vitest";
import { formatCalculatedTotal, formatPropertyPrice, PRICE_TYPES } from "../utils/propertyPricing";
import { getPropertyViews } from "../utils/propertyViews";
import { getGoogleMapsUrl, hasMapPosition } from "../pages/property-detail/propertyDetailUtils";

describe("property presentation utilities", () => {
  it("falls back when a valid price is unavailable", () => {
    expect(formatPropertyPrice(null)).toContain("marr");
    expect(formatPropertyPrice({ price: 0, priceType: PRICE_TYPES.TOTAL })).toContain("marr");
  });

  it("calculates the total for a per-square-meter price", () => {
    expect(formatCalculatedTotal({ price: 1_000, area: 80, priceType: PRICE_TYPES.PER_M2 }))
      .toContain("80,000");
  });

  it("normalizes supported property view counters", () => {
    expect(getPropertyViews({ viewCount: "12" })).toBe(12);
    expect(getPropertyViews({ visits: "invalid" })).toBe(0);
  });

  it("opens Google Maps at the property's exact coordinates", () => {
    const property = { latitude: "42.459123456", longitude: "21.469654321" };
    const url = new URL(getGoogleMapsUrl(property));

    expect(url.origin).toBe("https://www.google.com");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("query")).toBe("42.459123456,21.469654321");
    expect(hasMapPosition({ latitude: "", longitude: 21 })).toBe(false);
    expect(getGoogleMapsUrl({ latitude: 91, longitude: 21 })).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { formatCalculatedTotal, formatPropertyPrice, PRICE_TYPES } from "../utils/propertyPricing";
import { getPropertyViews } from "../utils/propertyViews";

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
});
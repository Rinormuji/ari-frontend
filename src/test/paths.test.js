import { describe, expect, it } from "vitest";
import { getSafeRedirect, paths } from "../routes/paths";

describe("route helpers", () => {
  it("builds property and admin edit routes", () => {
    expect(paths.propertyDetail(42)).toBe("/properties/42");
    expect(paths.adminPropertyEdit(42)).toBe("/admin/properties/edit/42");
  });

  it("rejects external redirect targets", () => {
    expect(getSafeRedirect("https://example.com")).toBeNull();
    expect(getSafeRedirect("//example.com")).toBeNull();
    expect(getSafeRedirect("/profile")).toBe("/profile");
  });

  it("encodes protected-route redirects safely", () => {
    expect(paths.loginWithRedirect("/appointment?propertyId=7"))
      .toBe("/login?redirect=%2Fappointment%3FpropertyId%3D7");
  });
});
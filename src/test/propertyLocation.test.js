import { describe, expect, it } from "vitest";
import { buildPropertyLocation, formatPropertyLocation, parsePropertyLocation } from "../utils/propertyLocation";

describe("property location", () => {
  it("shows municipality and neighborhood when present", () => {
    expect(formatPropertyLocation({ location: "Gjilan, Gavran" })).toBe("Gjilan, Gavran");
    expect(formatPropertyLocation({ location: "Gjilan" })).toBe("Gjilan");
  });

  it("keeps the village choice after saving and loading", () => {
    const location = buildPropertyLocation("Gjilan", "Zhegër", "village");
    expect(location).toBe("Gjilan, Fshati Zhegër");
    expect(parsePropertyLocation({ location })).toEqual({ city: "Gjilan", area: "Zhegër", areaType: "village" });
    expect(formatPropertyLocation({ location })).toBe("Gjilan, Zhegër");
  });

  it("does not duplicate a village prefix entered by an editor", () => {
    expect(buildPropertyLocation("Gjilan", "Fshati Zhegër", "village")).toBe("Gjilan, Fshati Zhegër");
  });
});

import { expect, it } from "vitest";
import { kosovoBounds, kosovoStreetStyle, kosovoSatelliteLabelsStyle } from "../utils/kosovoMap";
import { kosovoPlaces } from "../data/kosovoPlaces";

it("derives Kosovo's extent from the boundary and includes the main cities", () => {
  const [[south, west], [north, east]] = kosovoBounds;
  expect(south).toBeGreaterThan(41.8);
  expect(north).toBeLessThan(43.4);
  expect(west).toBeGreaterThan(19.9);
  expect(east).toBeLessThan(21.9);
  for (const place of kosovoPlaces) {
    expect(place.lat).toBeGreaterThan(south);
    expect(place.lat).toBeLessThan(north);
    expect(place.lng).toBeGreaterThan(west);
    expect(place.lng).toBeLessThan(east);
  }
});

it("preserves detailed OSM labels while removing political boundaries and city labels", () => {
  const style = {
    version: 8,
    sources: { basemap: {} },
    layers: [
      { id: "land", type: "fill" },
      { id: "road", type: "line" },
      { id: "country-label", type: "symbol" },
      { id: "town-label", type: "symbol" },
      { id: "village", type: "symbol", minzoom: 11 },
      { id: "neighborhood", type: "symbol", minzoom: 14 },
      { id: "road-label", type: "symbol", "source-layer": "road/label", minzoom: 8 },
      { id: "Boundary/disputed", type: "line" },
      { id: "political-outline", type: "line", "source-layer": "Admin0 boundary" },
    ],
  };
  expect(kosovoStreetStyle(style).layers.map(({ id }) => id)).toEqual(["land", "road", "village", "neighborhood", "road-label"]);
  const labels = kosovoSatelliteLabelsStyle(style).layers;
  expect(labels.map(({ id }) => id)).toEqual(["village", "neighborhood", "road-label"]);
  expect(labels.map(({ minzoom }) => minzoom)).toEqual([11, 14, 10]);
  expect(style.layers).toHaveLength(9);
});

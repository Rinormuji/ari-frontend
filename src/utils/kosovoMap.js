import kosovoBoundary from "../data/kosovoBoundary.json";

const ring = kosovoBoundary.geometry.coordinates[0];
export const kosovoBounds = [
  [Math.min(...ring.map(([, lat]) => lat)), Math.min(...ring.map(([lng]) => lng))],
  [Math.max(...ring.map(([, lat]) => lat)), Math.max(...ring.map(([lng]) => lng))],
];

// Our local layer owns country borders and city names. Keep OSM's detailed
// village, neighbourhood, road and point-of-interest labels as supplied.
const keepProviderLayer = (layer) => {
  const source = layer["source-layer"] || layer.id;
  if (layer.type === "line" && /boundary|admin|disput/i.test(`${layer.id} ${source}`)) return false;
  if (layer.type === "symbol" && /country|continent|admin|city|town|capital/i.test(source)) return false;
  return true;
};

export const kosovoStreetStyle = (style) => ({
  ...style,
  layers: style.layers.filter(keepProviderLayer),
});

export const kosovoSatelliteLabelsStyle = (style) => ({
  ...style,
  layers: style.layers.filter((layer) => layer.type === "symbol" && keepProviderLayer(layer)).map((layer) => ({
    ...layer,
    minzoom: Math.max(10, layer.minzoom || 0),
  })),
});

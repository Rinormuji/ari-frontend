import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { kosovoStreetStyle, kosovoSatelliteLabelsStyle } from "../utils/kosovoMap";
import "maplibre-gl/dist/maplibre-gl.css";

export default function KosovoStreetLayer({ apiKey, onError, satellite = false }) {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    let layer;
    import("esri-leaflet-vector").then(({ vectorBasemapLayer }) => {
      if (cancelled) return;
      layer = vectorBasemapLayer(satellite ? "open/hybrid/detail" : "open/streets", {
        apikey: apiKey, version: 2, language: "local",
        attributionUrls: ["https://static.arcgis.com/attribution/Vector/OpenStreetMap_v2"],
        pane: satellite ? "esri-labels" : "tilePane",
        style: satellite ? kosovoSatelliteLabelsStyle : kosovoStreetStyle,
      });
      layer.on("load-error", onError);
      layer.addTo(map);
    }).catch(() => { if (!cancelled) onError(); });
    return () => {
      cancelled = true;
      if (layer) {
        layer.off("load-error", onError);
        layer.remove();
      }
    };
  }, [map, apiKey, onError, satellite]);
  return null;
}

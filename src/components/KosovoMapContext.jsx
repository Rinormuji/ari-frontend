import { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import kosovoBoundary from "../data/kosovoBoundary.json";
import { kosovoPlaces } from "../data/kosovoPlaces";
import { kosovoBounds } from "../utils/kosovoMap";

const attribution = 'Kufiri: <a href="https://www.geoboundaries.org/api/current/gbOpen/XKX/ADM0/">geoBoundaries / OpenStreetMap</a> (CC BY-SA 2.0)';

export default function KosovoMapContext({ overview, satellite }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(kosovoBounds);
    const updateLimits = () => {
      const atOverview = map.getZoom() <= map.getMinZoom() + 0.01;
      // Leaflet clamps getBoundsZoom to the current minZoom. Reset that limit
      // before recalculating, so narrow screens can still fit the whole country.
      map.setMinZoom(0);
      map.setMinZoom(map.getBoundsZoom(bounds, false, L.point(56, 124)));
      if (atOverview) focusKosovo();
    };
    const focusKosovo = () => map.fitBounds(bounds, {
      paddingTopLeft: [28, 76], paddingBottomRight: [28, 48], animate: false,
    });
    map.setMaxBounds(bounds.pad(0.3));
    updateLimits();
    if (overview) focusKosovo();
    map.on("resize", updateLimits);

    const focusControl = L.control({ position: "topright" });
    focusControl.onAdd = () => {
      const container = L.DomUtil.create("div", "leaflet-control ari-kosovo-control");
      const button = L.DomUtil.create("button", "", container);
      button.type = "button";
      button.textContent = "Kosovë";
      button.setAttribute("aria-label", "Fokus te Kosova");
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
      L.DomEvent.on(button, "click", focusKosovo);
      return container;
    };
    focusControl.addTo(map);
    return () => {
      map.off("resize", updateLimits);
      focusControl.remove();
    };
  }, [map, overview]);

  useEffect(() => {
    const outline = L.geoJSON(kosovoBoundary, {
      interactive: false,
      style: { color: satellite ? "#071f1a" : "#ffffff", weight: 6, opacity: 0.75, fill: false, dashArray: null },
    }).addTo(map);
    const border = L.geoJSON(kosovoBoundary, {
      interactive: false,
      attribution,
      style: { color: satellite ? "#ffffff" : "#0F4638", weight: 2.5, opacity: 1, fill: false, dashArray: null },
    }).addTo(map);

    const pane = map.getPane("ari-place-labels") || map.createPane("ari-place-labels");
    pane.style.zIndex = "450";
    pane.style.pointerEvents = "none";
    const labels = L.layerGroup().addTo(map);
    const addLabel = (name, position, country = false, capital = false) => {
      const label = document.createElement("span");
      label.textContent = name;
      label.className = `ari-place-name ${satellite ? "ari-place-name-satellite" : "ari-place-name-street"}${country ? " ari-country-name" : ""}${capital ? " ari-capital-name" : ""}`;
      L.marker(position, {
        pane: "ari-place-labels", interactive: false, keyboard: false,
        icon: L.divIcon({ className: "ari-place-label", html: label, iconSize: [0, 0], iconAnchor: [0, 0] }),
      }).addTo(labels);
    };
    const drawLabels = () => {
      labels.clearLayers();
      const zoom = map.getZoom();
      const viewport = map.getBounds();
      const occupied = [];
      for (const place of kosovoPlaces) {
        const position = [place.lat, place.lng];
        if (zoom < place.minZoom || !viewport.contains(position)) continue;
        const point = map.latLngToContainerPoint(position);
        const width = place.name.length * 7 + 20;
        const box = { left: point.x - width / 2, right: point.x + width / 2, top: point.y + 4, bottom: point.y + 25 };
        if (occupied.some((other) => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top)) continue;
        occupied.push(box);
        addLabel(place.name, position, false, place.capital);
      }
      if (zoom <= 10.5) addLabel("KOSOVË", [42.78, 20.45], true);
    };
    drawLabels();
    map.on("zoomend moveend resize", drawLabels);
    return () => {
      map.off("zoomend moveend resize", drawLabels);
      labels.remove();
      border.remove();
      outline.remove();
    };
  }, [map, satellite]);

  return null;
}

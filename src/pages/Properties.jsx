import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import banner from "../assets/images/banner.jpg";
import { propertyAPI } from '../services/api';

/* Marker icon */
const propertyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

/* Haversine distance */
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* Map click handler */
function MapClickHandler({ circleEnabled, onSetCenter }) {
  useMapEvents({
    click(e) {
      if (!circleEnabled) return;
      onSetCenter({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const Properties = () => {
  const navigate = useNavigate();
  const defaultCenter = { lat: 42.6629, lng: 21.1655 };

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("");
  const [circleEnabled, setCircleEnabled] = useState(false);
  const [centerPoint, setCenterPoint] = useState(defaultCenter);
  const [radiusKm, setRadiusKm] = useState(10);

  const mapLocation = (location) => {
    if (!location) return { city: '', neighborhood: '' };
    const parts = location.split(',', 2);
    return { city: parts[0].trim(), neighborhood: parts[1]?.trim() || '' };
  };

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getProperties({ page: 0, size: 1000 });
        const content = res.data.content || [];

        const mapped = content.map((p) => {
          const { city, neighborhood } = mapLocation(p.location);
          return {
            id: p.id,
            title: p.title,
            city,
            neighborhood,
            type: p.type,
            status: p.status,
            area: p.area,
            price: p.price,
            rooms: p.rooms ?? 0,
            floor: p.floor ?? 0,
            images: p.images ?? [],
            lat: p.latitude ?? null,
            lng: p.longitude ?? null,
          };
        });

        setProperties(mapped);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const toggleCircle = () => {
    if (!circleEnabled && !centerPoint) setCenterPoint(defaultCenter);
    setCircleEnabled((s) => !s);
  };

  // Lista e filtruar, përdoret për markerat dhe side list
  const filtered = useMemo(() => {
    let list = [...properties];

    if (cityFilter) list = list.filter((p) => p.city === cityFilter);

    if (circleEnabled && centerPoint) {
      list = list.filter((p) => {
        if (p.lat == null || p.lng == null) return false;
        const d = haversineKm(centerPoint.lat, centerPoint.lng, p.lat, p.lng);
        return d <= Number(radiusKm);
      });
    }

    return list;
  }, [properties, cityFilter, circleEnabled, centerPoint, radiusKm]);

  const cityOptions = useMemo(() => {
    const s = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(s);
  }, [properties]);

  if (loading) return <div className="p-4">Loading properties...</div>;

  return (
    <div className="properties-page px-4 py-6">
      {/* FILTER BAR */}
      <div className="properties-filter-bar">
        <div className="filter-left">
          <label className="filter-label">Qyteti</label>
          <select
            className="filter-select"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">Të gjitha qytetet</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-middle">
          <label className="filter-label">Radius Search</label>
          <button
            className={`radius-toggle-btn ${circleEnabled ? "on" : "off"}`}
            onClick={toggleCircle}
          >
            {circleEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {circleEnabled && (
          <div className="filter-right">
            <label className="filter-label">Rreze (km)</label>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="radius-range"
            />
            <input
              type="number"
              min="0"
              max="50"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="radius-number"
            />
            <span>km</span>
          </div>
        )}
      </div>

      {/* MAP + SIDE LIST */}
      <div className="properties-map-and-side max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="properties-map-col lg:col-span-2">
          <div className="properties-map-wrapper">
            <MapContainer
              center={[centerPoint.lat ?? defaultCenter.lat, centerPoint.lng ?? defaultCenter.lng]}
              zoom={10}
              className="properties-map"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapClickHandler circleEnabled={circleEnabled} onSetCenter={setCenterPoint} />

              {circleEnabled && centerPoint && (
                <Circle
                  center={[centerPoint.lat, centerPoint.lng]}
                  radius={Number(radiusKm) * 1000}
                  pathOptions={{ color: "#2563eb", fillOpacity: 0.08 }}
                />
              )}

              {/* Markerat */}
              {filtered.filter(p => p.lat != null && p.lng != null).map((p) => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={propertyIcon}
                  eventHandlers={{ click: () => navigate(`/properties/${p.id}`) }}
                >
                  <Tooltip direction="top" offset={[0, -12]} opacity={1} interactive>
                    <div className="properties-tooltip">
                      <img src={p.images?.[0] ?? banner} alt={p.title} className="tooltip-thumb" />
                      <div className="tooltip-meta">
                        <div className="tooltip-title">{p.title}</div>
                        <div className="tooltip-sub">
                          {p.city} · {p.type} · {p.status === "FOR_SALE" ? "Shitje" : "Qira"}
                        </div>
                        <div className="tooltip-price">{p.price?.toLocaleString()} €</div>
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* SIDE LIST */}
        <aside className="properties-side-col lg:col-span-1">
          <div className="side-card">
            <h3 className="side-title">Prona — {filtered.length}</h3>
            <div className="side-list side-list-scroll">
              {filtered.map((p) => (
                <button key={p.id} className="side-item" onClick={() => navigate(`/properties/${p.id}`)}>
                  <img src={p.images?.[0] ?? banner} alt="" className="side-thumb" />
                  <div className="side-meta">
                    <div className="side-title-row">
                      <div className="side-name">{p.title}</div>
                      <div className="side-price">{p.price?.toLocaleString()}€</div>
                    </div>
                    <div className="side-sub">{p.city} · {p.area} m²</div>
                  </div>
                </button>
              ))}
              {filtered.length === 0 && <div className="side-empty">Nuk u gjet pronë.</div>}
            </div>
            <div className="side-hint">
              {circleEnabled ? "Kliko në hartë për të vendosur qendrën." : "Radius OFF: shfaq të gjitha pronat."}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Properties;

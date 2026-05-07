import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Circle as CircleIcon } from "lucide-react";
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="w-8 h-8 rounded-full border-2 border-[#FFAE42] border-t-transparent animate-spin" />
        <span className="text-sm">Duke ngarkuar pronat...</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pb-10">

      {/* Filter bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
          {/* City filter */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm shadow-sm focus-within:border-[#FFAE42]">
            <MapPin size={15} className="text-[#FFAE42] shrink-0" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="outline-none text-sm text-gray-700 bg-transparent"
            >
              <option value="">Të gjitha qytetet</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Radius toggle */}
          <button
            onClick={toggleCircle}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${circleEnabled ? "bg-[#FFAE42] text-black border-[#FFAE42]" : "bg-white text-gray-600 border-gray-200 hover:border-[#FFAE42]/50"}`}
          >
            <CircleIcon size={15} />
            Radius: {circleEnabled ? "ON" : "OFF"}
          </button>

          {/* Radius slider */}
          {circleEnabled && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-xs text-gray-400 shrink-0">Rreze:</span>
              <input type="range" min="0" max="50" step="1" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-28 accent-[#FFAE42]" />
              <input type="number" min="0" max="50" value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#FFAE42]" />
              <span className="text-xs text-gray-400">km</span>
            </div>
          )}

          <span className="ml-auto text-xs text-gray-400">{filtered.length} prona</span>
        </div>
      </div>

      {/* Map + Side list */}
      <div className="max-w-6xl mx-auto px-4 pt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 z-30">
        {/* Map */}
        <div className="lg:col-span-2 z-30 rounded-2xl overflow-hidden shadow-sm border border-gray-200" style={{ height: "70vh" }}>
          <MapContainer
            center={[centerPoint.lat ?? defaultCenter.lat, centerPoint.lng ?? defaultCenter.lng]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickHandler circleEnabled={circleEnabled} onSetCenter={setCenterPoint} />
            {circleEnabled && centerPoint && (
              <Circle center={[centerPoint.lat, centerPoint.lng]} radius={Number(radiusKm) * 1000} pathOptions={{ color: "#FFAE42", fillOpacity: 0.08 }} />
            )}
            {filtered.filter((p) => p.lat != null && p.lng != null).map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={propertyIcon} eventHandlers={{ click: () => navigate(`/properties/${p.id}`) }}>
                <Tooltip direction="top" offset={[0, -12]} opacity={1} interactive>
                  <div className="flex gap-2 items-start w-52">
                    <img src={p.images?.[0] ?? banner} alt={p.title} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-semibold text-xs leading-snug line-clamp-2">{p.title}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{p.city} · {p.type} · {p.status === "FOR_SALE" ? "Shitje" : "Qira"}</p>
                      <p className="text-[#FFAE42] font-bold text-xs mt-0.5">{p.price?.toLocaleString()} €</p>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Side list */}
        <aside className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden" style={{ height: "70vh" }}>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm">Prona — {filtered.length}</h3>
            {circleEnabled ? (
              <p className="text-xs text-gray-400 mt-0.5">Kliko në hartë për të vendosur qendrën.</p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">Radius OFF: shfaq të gjitha pronat.</p>
            )}
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => navigate(`/properties/${p.id}`)} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left">
                <img src={p.images?.[0] ?? banner} alt="" className="w-14 h-12 object-cover rounded-xl shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm text-gray-800 line-clamp-1">{p.title}</p>
                  <p className="text-[#FFAE42] font-bold text-sm">{p.price?.toLocaleString()} €</p>
                  <p className="text-xs text-gray-400">{p.city} · {p.area} m²</p>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">Nuk u gjet pronë.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Properties;

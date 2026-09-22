import { useEffect, useId } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { configureLeafletIcons } from "../../utils/leafletIcons";

configureLeafletIcons();

function MapSelection({ lat, lng, onSelect }) {
  const map = useMap();
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  useEffect(() => {
    if (lat !== null && lng !== null) {
      map.panTo([lat, lng]);
    }
  }, [map, lat, lng]);
  return null;
}

const coordinate = (value, limit) => {
  if (value == null || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
};

export default function MapPicker({ lat, lng, onSelect }) {
  const id = useId();
  const latitude = coordinate(lat, 90);
  const longitude = coordinate(lng, 180);
  const hasPosition = latitude !== null && longitude !== null;
  const position = hasPosition ? [latitude, longitude] : [42.6629, 21.1655];
  const hasLat = lat != null && String(lat).trim() !== "";
  const hasLng = lng != null && String(lng).trim() !== "";

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/50">Kliko në hartë ose shkruaj koordinatat më poshtë për të zgjedhur vendndodhjen.</p>
      <MapContainer
        center={position}
        zoom={hasPosition ? 14 : 9}
        style={{ height: "340px", width: "100%", borderRadius: "12px", zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <MapSelection lat={latitude} lng={longitude} onSelect={onSelect} />
        {hasPosition && <Marker position={position} />}
      </MapContainer>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-lat`} className="mb-1 block text-xs text-white/70">Latitude (Lat)</label>
          <input id={`${id}-lat`} name="latitude" type="number" min="-90" max="90" step="any"
            value={lat ?? ""} required={hasLng} onChange={(event) => onSelect(event.target.value, lng)}
            placeholder="42.6629" aria-describedby={`${id}-hint`}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]" />
        </div>
        <div>
          <label htmlFor={`${id}-lng`} className="mb-1 block text-xs text-white/70">Longitude (Lng)</label>
          <input id={`${id}-lng`} name="longitude" type="number" min="-180" max="180" step="any"
            value={lng ?? ""} required={hasLat} onChange={(event) => onSelect(lat, event.target.value)}
            placeholder="21.1655" aria-describedby={`${id}-hint`}
            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]" />
        </div>
      </div>
      <p id={`${id}-hint`} className="text-xs text-white/50">Latitude: −90 deri 90. Longitude: −180 deri 180. Plotëso të dyja koordinatat ose lëri të dyja bosh.</p>
    </div>
  );
}

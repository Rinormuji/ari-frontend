import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { configureLeafletIcons } from "../../utils/leafletIcons";

configureLeafletIcons();

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * MapPicker — click anywhere on the map to set latitude & longitude.
 * Props:
 *   lat       {number|string}  current latitude value
 *   lng       {number|string}  current longitude value
 *   onSelect  {(lat, lng) => void}
 */
export default function MapPicker({ lat, lng, onSelect }) {
  const position =
    lat && lng ? [parseFloat(lat), parseFloat(lng)] : [42.6629, 21.1655]; // Kosovo centre

  return (
    <div className="space-y-2">
      <p className="text-xs text-white/50">Kliko në hartë për të zgjedhur vendndodhjen</p>
      <MapContainer
        center={position}
        zoom={lat && lng ? 14 : 9}
        style={{ height: '340px', width: '100%', borderRadius: '12px', zIndex: 0 }}
        key={`${lat}-${lng}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <ClickHandler onSelect={onSelect} />
        {lat && lng && (
          <Marker position={[parseFloat(lat), parseFloat(lng)]} />
        )}
      </MapContainer>

      <div className="flex gap-4 text-xs text-white/50 bg-white/5 rounded-lg px-3 py-2">
        <span>Lat: <strong className="text-white">{lat || "—"}</strong></span>
        <span>Lng: <strong className="text-white">{lng || "—"}</strong></span>
      </div>
    </div>
  );
}

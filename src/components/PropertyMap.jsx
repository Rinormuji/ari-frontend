import { useCallback, useState } from "react";
import { Map, Satellite } from "lucide-react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import KosovoMapContext from "./KosovoMapContext";
import KosovoStreetLayer from "./KosovoStreetLayer";

const arcgisKey = (import.meta.env.VITE_ARCGIS_API_KEY || "").trim();
const satelliteUrl = `https://ibasemaps-api.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}?token=${encodeURIComponent(arcgisKey)}`;
const imageryAttribution = 'Powered by <a href="https://www.esri.com/">Esri</a> | Esri, Vantor, Earthstar Geographics, and the GIS User Community';

export default function PropertyMap({ children, className = "", label = "Harta e pronës", overview = false, ...mapProps }) {
  const [view, setView] = useState(arcgisKey ? "satellite" : "street");
  const [failed, setFailed] = useState(false);
  const handleLayerError = useCallback(() => setFailed(true), []);

  const changeView = (nextView) => {
    setFailed(false);
    setView(nextView);
  };

  return (
    <div className={`relative isolate overflow-hidden rounded-2xl border border-[#0F4638]/15 bg-[#edf1ee] shadow-sm ${className}`} aria-label={label}>
      <MapContainer {...mapProps} zoomControl={false} maxZoom={19} zoomSnap={0.25} maxBoundsViscosity={1} className="ari-map h-full w-full" style={{ height: "100%", width: "100%" }}>
        {view === "street" && arcgisKey ? <KosovoStreetLayer apiKey={arcgisKey} onError={handleLayerError} /> : (
        <TileLayer
          key={view}
          url={view === "satellite" ? satelliteUrl : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution={view === "satellite" ? imageryAttribution : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'}
          maxNativeZoom={19}
          maxZoom={19}
          eventHandlers={{ tileerror: handleLayerError }}
        />
        )}
        {view === "satellite" && arcgisKey && <KosovoStreetLayer apiKey={arcgisKey} onError={handleLayerError} satellite />}
        <KosovoMapContext overview={overview} satellite={view === "satellite"} />
        <ZoomControl position="bottomright" />
        {children}
      </MapContainer>

      <div role="group" aria-label="Pamja e hartës" className="absolute left-3 top-3 z-[1000] flex gap-1 rounded-xl border border-white/80 bg-white/95 p-1 shadow-lg backdrop-blur-sm">
        {[
          { value: "street", text: "Hartë", icon: Map },
          { value: "satellite", text: "Satelit", icon: Satellite },
        ].map(({ value, text, icon: Icon }) => (
          <button key={value} type="button" aria-pressed={view === value}
            disabled={value === "satellite" && !arcgisKey}
            title={value === "satellite" && !arcgisKey ? "Pamja satelitore nuk është ende e disponueshme" : text}
            onClick={() => changeView(value)}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4638] disabled:cursor-not-allowed disabled:opacity-40 ${view === value ? "bg-[#0F4638] text-[#EFD391] shadow-sm" : "text-[#0F4638] hover:bg-[#edf4ef]"}`}>
            <Icon size={15} aria-hidden="true" /> {text}
          </button>
        ))}
      </div>

      {failed && (
        <div role="status" className="absolute bottom-8 left-3 right-16 z-[1000] rounded-xl border border-[#EFD391]/60 bg-white/95 px-3 py-2 text-xs text-[#0F4638] shadow-lg">
          Disa pjesë të hartës nuk u ngarkuan.
          <button type="button" onClick={() => changeView(view === "satellite" ? "street" : "satellite")}
            disabled={!arcgisKey} className="ml-2 font-semibold underline disabled:hidden">
            {view === "satellite" ? "Shfaq hartën" : "Shfaq satelitin"}
          </button>
        </div>
      )}
    </div>
  );
}

import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export function configureLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

export const propertyMapIcon = L.divIcon({
  className: "ari-property-marker",
  html: '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46" aria-hidden="true"><path d="M18 44S2 27 2 18a16 16 0 1 1 32 0c0 9-16 26-16 26Z" fill="#0F4638" stroke="#EFD391" stroke-width="2"/><circle cx="18" cy="18" r="9" fill="#EFD391"/><path d="m12 18 6-5 6 5m-10-1v7h8v-7m-6 7v-4h4v4" fill="none" stroke="#0F4638" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  iconSize: [36, 46],
  iconAnchor: [18, 44],
  popupAnchor: [0, -40],
});

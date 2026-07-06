import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bed,
  Building2,
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  Eye,
  Layers,
  MapPin,
  Ruler,
  Trees,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { paths } from "../routes/paths";
import { getStatusLabel, getTypeLabel } from "../utils/propertyLabels";
import { formatPropertyPrice } from "../utils/propertyPricing";
import { formatPropertyViews } from "../utils/propertyViews";

const firstLocation = (property) => {
  const location = property.location || property.city || "";
  return location.split(",")[0]?.trim() || "Kosovë";
};

const PropertyCard = ({ property }) => {
  const images = property.images?.length ? property.images : ["/placeholder.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    (property.type === "BANESA" || property.type === "SHTEPI") && property.rooms
      ? { icon: Bed, label: `${property.rooms} dhoma` }
      : null,
    (property.type === "BANESA" || property.type === "LOKALE") && property.floor !== null && property.floor !== undefined && Number(property.floor) > 0
      ? { icon: Layers, label: `Kati ${property.floor}` }
      : null,
    property.type === "SHTEPI" && property.floor
      ? { icon: Layers, label: `${property.floor} kate` }
      : null,
    property.hasParking ? { icon: Car, label: "Parking" } : null,
    property.hasGarage ? { icon: Warehouse, label: "Garazh" } : null,
    property.hasGarden ? { icon: Trees, label: "Oborr" } : null,
  ].filter(Boolean).slice(0, 3);

  const handleBook = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const redirect = paths.appointmentForProperty(property.id);
    navigate(isAuthenticated ? redirect : paths.loginWithRedirect(redirect));
  };

  const nextImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={paths.propertyDetail(property.id)} className="group block h-full">
      <article className="flex h-full min-h-[430px] flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="relative h-52 shrink-0 overflow-hidden bg-[#edf1ee]">
          <img
            src={images[currentIndex]}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Foto e mëparshme"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white transition hover:bg-black/70"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Foto tjetër"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/45 p-1.5 text-white transition hover:bg-black/70"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center justify-between gap-3 text-xs font-medium text-gray-500">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[#D9BF7B]" />
              <span className="truncate">
                {getTypeLabel(property.type)}, {getStatusLabel(property.status)}
              </span>
            </span>
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#D9BF7B]" />
              <span className="truncate">{firstLocation(property)}</span>
            </span>
          </div>

          <h3 className="min-h-12 text-base font-bold leading-6 text-[#071f1a] line-clamp-2">
            {property.title}
          </h3>

          <div className="min-h-8">
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {features.map(({ icon: Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-1 rounded-full border border-[#0F4638]/10 bg-[#f5f6f3] px-2 py-1 text-xs font-medium text-[#0F4638]/75">
                    <Icon className="h-3 w-3 text-[#D9BF7B]" />
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-[#0F4638]">
              {formatPropertyPrice(property)}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
              <Ruler className="h-4 w-4 text-[#D9BF7B]" />
              {property.area || "-"} m²
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-600">
              <Eye className="h-4 w-4 text-[#D9BF7B]" />
              {formatPropertyViews(property)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleBook}
            className="mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#EFD391] text-sm font-bold text-black transition hover:bg-[#D9BF7B]"
          >
            <CalendarDays size={15} /> Rezervo Takim
          </button>
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;

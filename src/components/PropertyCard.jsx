import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Ruler,
  Euro,
  Bed,
  Layers,
  CalendarDays
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const PropertyCard = ({ property }) => {
  const images = property.images?.length ? property.images : ["/placeholder.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBook = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/appointment?propertyId=${property.id}`)}`);
    } else {
      navigate(`/appointment?propertyId=${property.id}`);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/properties/${property.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full">

        {/* IMAGE */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={images[currentIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition z-10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition z-10"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-4 space-y-2">

          {/* Type + City */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#FFAE42]" />
              <span className="capitalize">
                {property.type}, {property.status === "FOR_SALE" ? "Në shitje" : "Me qira"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#FFAE42]" />
              <span>{property.city?.split(',')[0] || property.city}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{property.title}</h3>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5">
            {(property.type === "BANESA" || property.type === "SHTEPI") && property.rooms && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Bed className="w-3 h-3 text-[#FFAE42]" />{property.rooms}
              </span>
            )}
            {(property.type === "BANESA" || property.type === "LOKALE") && property.floor && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Layers className="w-3 h-3 text-[#FFAE42]" />Kati: {property.floor}
              </span>
            )}
            {property.type === "SHTEPI" && property.floor && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                <Layers className="w-3 h-3 text-[#FFAE42]" />{property.floor} Kate
              </span>
            )}
            {property.hasElevator && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">🔼 Ashensor</span>}
            {property.hasBalcony && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">🌇 Ballkon</span>}
            {property.hasGarage && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">🚗 Garazh</span>}
            {property.hasGarden && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">🌳 Oborr</span>}
            {property.hasParking && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">🅿️ Parking</span>}
          </div>

          {/* Price & Area */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-sm">
              <Euro className="w-4 h-4 text-[#FFAE42]" />
              <span className="font-bold text-blue-600">{property.price.toLocaleString()} €</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Ruler className="w-4 h-4 text-[#FFAE42]" />
              <span>{property.area} m²</span>
            </div>
          </div>

          {/* Book button */}
          <button
            onClick={handleBook}
            className="w-full mt-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-[#FFAE42] hover:bg-[#e09a35] text-black rounded-xl transition-colors"
          >
            <CalendarDays size={14} /> Rezervo Takim
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;

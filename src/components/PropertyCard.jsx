import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Building2,
  Ruler,
  Euro,
  Bed,
  Layers
} from "lucide-react";

const PropertyCard = ({ property }) => {
  const images = property.images?.length ? property.images : ["/placeholder.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/properties/${property.id}`} className="property-card-link">
      <div className="property-card">
        {/* ===== IMAGE WRAPPER ===== */}
        <div className="card-image group relative">
          <img
            src={images[currentIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* ===== SHIGJETAT ===== */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition z-10 slick-prev"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition z-10 slick-next"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* ===== CARD INFO ===== */}
        <div className="property-card-content-wrapper">
          <div className="p-4 space-y-2 property-card-info">
            <div className="flex items-center text-gray-600 text-sm gap-2 statusi property-card-meta">
              <div className="flex items-center text-gray-600 text-sm gap-2 statusi property-card-meta1">
                <Building2 className="text-[#FFAE42] w-4 h-4 property-card-icon" />
                <span className="capitalize property-card-type">
                  {property.type}, {property.status === "FOR_SALE" ? "Në shitje" : "Me qira"}
                </span>
              </div>

              <div className="flex items-center text-gray-600 text-sm gap-2 statusi property-card-meta2">
  <MapPin className="text-[#FFAE42] w-4 h-4 ml-2 property-card-iconn" />
  <span className="property-card-city">
    {property.city?.split(',')[0] || property.city}
  </span>
</div>

            </div>

            {/* Titulli */}
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 property-card-title">
              {property.title}
            </h3>

            {/* Infot e prones*/}
            <div className="flex items-center text-gray-600 text-sm gap-2 property-card-infos property-card-info-group">
              {(property.type === "BANESA" || property.type === "SHTEPI") && (
                <div className="flex items-center text-gray-600 text-sm gap-2 property-card-propertyInfo">
                  <div className="flex items-center gap-1 property-card-propertyInfo1">
                    <Bed className="w-4 h-4 text-[#FFAE42]" />
                    <span>{property.rooms}</span>
                  </div>
                </div>
              )}
              {/* {property.type === "BANESA" && (
                <div className="flex items-center gap-2 property-card-floor">
                  <Layers className="w-4 h-4 text-[#FFAE42]" />
                  <span>Kati: {property.floor}</span>
                </div>
              )} */}
              <div className="flex items-center gap-2 property-card-floor">
                <Layers className="w-4 h-4 text-[#FFAE42]" />
                <span>{property.type === "BANESA" ? `Kati: ${property.floor}` : `Kate: ${property.floor || 0}`}</span>
              </div>
            </div>

            {/* Çmimi & Sipërfaqja */}
            <div className="flex items-center justify-between mt-3 property-card-details">
              <div className="flex items-center text-gray-700 text-sm property-card-price">
                <Euro className="w-4 h-4 text-[#FFAE42] mr-1 property-card-icon" />
                <span className="font-bold text-blue-600 property-card-price-value">
                  {property.price.toLocaleString()} €
                </span>
              </div>
              <div className="flex items-center text-gray-600 text-sm property-card-area">
                <Ruler className="w-4 h-4 text-[#FFAE42] mr-1 property-card-icon" />
                <span className="property-card-area-value">{property.area} m²</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;

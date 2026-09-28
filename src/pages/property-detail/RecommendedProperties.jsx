import { ArrowUpRight, MapPin, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../../routes/paths";
import { getStatusLabel, getTypeLabel } from "../../utils/propertyLabels";
import { formatPropertyPrice } from "../../utils/propertyPricing";
import { placeholderImage } from "./propertyDetailUtils";

const RecommendedProperties = ({ properties }) => {
  if (!properties.length) return null;

  return (
    <section aria-labelledby="recommended-properties-title" className="mt-12 border-t border-[#0F4638]/10 pt-9">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#9b7a34]">Zgjedhur për ju</p>
          <h2 id="recommended-properties-title" className="text-xl font-bold text-[#071f1a] sm:text-2xl">Prona të ngjashme</h2>
          <p className="mt-1 text-sm text-[#0F4638]/60">Bazuar në lokacion, çmim, tip dhe sipërfaqe.</p>
        </div>
        <Link to={paths.properties} className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F4638] underline-offset-4 hover:underline">
          Shiko të gjitha pronat <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {properties.slice(0, 4).map((property) => (
          <Link key={property.id} to={paths.propertyDetail(property.id)}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#0F4638]/10 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#D9BF7B] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0F4638]">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#edf1ee]">
              <img src={property.images?.[0] || placeholderImage} loading="lazy" alt={property.title || "Prona e rekomanduar"}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#0F4638] shadow-sm">
                {getTypeLabel(property.type)} · {getStatusLabel(property.status)}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 text-[#071f1a]">{property.title}</h3>
              <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-[#0F4638]/60">
                <MapPin size={14} className="shrink-0 text-[#9b7a34]" aria-hidden="true" />
                <span className="truncate">{property.city || property.location || "Lokacioni i papërcaktuar"}</span>
              </p>
              <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#0F4638]/10 pt-4">
                <span className="text-base font-bold text-[#0F4638]">{formatPropertyPrice(property)}</span>
                {property.area && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#0F4638]/65">
                    <Ruler size={14} aria-hidden="true" /> {property.area} m²
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedProperties;

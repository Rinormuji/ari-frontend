import { Link } from "react-router-dom";
import { paths } from "../../routes/paths";
import { formatPropertyPrice } from "../../utils/propertyPricing";
import { placeholderImage } from "./propertyDetailUtils";

const RecommendedProperties = ({ properties }) => {
  if (!properties.length) return null;

  return (
    <section>
      <h2 className="mb-5 font-bold text-gray-900">Prona të rekomanduara</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {properties.map((property) => (
          <Link
            key={property.id}
            to={paths.propertyDetail(property.id)}
            className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="h-36 overflow-hidden">
              <img
                src={property.images?.[0] || placeholderImage}
                alt={property.title || ""}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-semibold text-gray-800">{property.title}</p>
              <p className="mt-1 text-sm font-bold text-blue-600">{formatPropertyPrice(property)}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                {property.area || "-"} m² · {property.city || property.location || ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendedProperties;

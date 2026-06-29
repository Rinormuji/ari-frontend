import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, ListFilter, MapPin, Search, X } from "lucide-react";
import { propertyAPI } from "../services/api";
import PropertyCard from "../components/PropertyCard";

const PAGE_SIZE = 12;

const typeLabels = {
  BANESA: "Banesë",
  SHTEPI: "Shtëpi",
  LOKALE: "Lokal",
  TOKA: "Tokë",
};

const statusLabels = {
  FOR_SALE: "Në shitje",
  FOR_RENT: "Me qira",
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    status: "",
  });

  const fetchProperties = async (currentPage, currentFilters) => {
    setLoading(true);
    try {
      const params = {
        page: currentPage - 1,
        size: PAGE_SIZE,
        sort: "id,desc",
      };

      if (currentFilters.location) params.location = currentFilters.location;
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.status) params.status = currentFilters.status;

      const res = await propertyAPI.getProperties(params);
      const data = res.data;

      if (data?.content) {
        setProperties(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || data.content.length);
      } else if (Array.isArray(data)) {
        setProperties(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        setProperties([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(page, filters);
  }, [page, filters]);

  const cityOptions = useMemo(() => {
    const cities = new Set(
      properties
        .map((property) => (property.location || property.city || "").split(",")[0].trim())
        .filter(Boolean)
    );
    return Array.from(cities);
  }, [properties]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ location: "", type: "", status: "" });
    setPage(1);
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const items = [1];
    if (page > 3) items.push("left");

    for (let current = Math.max(2, page - 1); current <= Math.min(totalPages - 1, page + 1); current += 1) {
      items.push(current);
    }

    if (page < totalPages - 2) items.push("right");
    items.push(totalPages);
    return items;
  }, [page, totalPages]);

  return (
    <main className="min-h-screen bg-[#f7f8f6]">
      <section className="border-b border-[#0F4638]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0F4638]/60">Ari Real Estate</p>
              <h1 className="mt-1 text-2xl font-bold text-[#071f1a]">Të gjitha pronat</h1>
            </div>
            <p className="text-sm font-medium text-[#0F4638]/70">
              {loading ? "Duke ngarkuar..." : `${totalElements} prona gjithsej`}
            </p>
          </div>

          <div className="grid gap-3 rounded-xl border border-[#0F4638]/10 bg-[#f9faf8] p-3 md:grid-cols-[1fr_180px_180px_auto]">
            <label className="flex items-center gap-2 rounded-lg border border-[#0F4638]/10 bg-white px-3 py-2 text-sm text-[#0F4638]">
              <MapPin size={16} className="text-[#D9BF7B]" />
              <select
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                <option value="">Të gjitha qytetet</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-[#0F4638]/10 bg-white px-3 py-2 text-sm text-[#0F4638]">
              <Building2 size={16} className="text-[#D9BF7B]" />
              <select
                value={filters.type}
                onChange={(event) => updateFilter("type", event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                <option value="">Të gjitha llojet</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-[#0F4638]/10 bg-white px-3 py-2 text-sm text-[#0F4638]">
              <ListFilter size={16} className="text-[#D9BF7B]" />
              <select
                value={filters.status}
                onChange={(event) => updateFilter("status", event.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                <option value="">Shitje dhe qira</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F4638]/10 bg-white px-4 py-2 text-sm font-semibold text-[#0F4638] transition hover:border-[#D9BF7B]"
            >
              <X size={15} /> Pastro
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-xl bg-white shadow-sm" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#0F4638]/10 bg-white px-3 text-sm font-semibold text-[#0F4638] disabled:opacity-40"
                >
                  <ChevronLeft size={16} /> Pas
                </button>

                {paginationItems.map((item, index) =>
                  typeof item === "string" ? (
                    <span key={`${item}-${index}`} className="px-2 text-sm text-gray-400">...</span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPage(item)}
                      className={`h-10 min-w-10 rounded-lg text-sm font-semibold transition ${
                        page === item
                          ? "bg-[#0F4638] text-[#EFD391]"
                          : "border border-[#0F4638]/10 bg-white text-[#0F4638] hover:border-[#D9BF7B]"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-[#0F4638]/10 bg-white px-3 text-sm font-semibold text-[#0F4638] disabled:opacity-40"
                >
                  Para <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#0F4638]/15 bg-white text-center">
            <Search size={34} className="text-[#0F4638]/25" />
            <p className="text-base font-semibold text-[#0F4638]">Nuk u gjet asnjë pronë.</p>
            <button type="button" onClick={clearFilters} className="text-sm font-semibold text-[#0F4638] underline">
              Pastro filtrat
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default Properties;

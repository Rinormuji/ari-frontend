import { useEffect, useMemo, useState } from "react";
import {
  Bath,
  Bed,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Euro,
  ListFilter,
  MapPin,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
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

const initialFilters = {
  q: "",
  location: "",
  type: "",
  status: "",
  minPrice: "",
  maxPrice: "",
  minArea: "",
  maxArea: "",
  minRooms: "",
  minBathrooms: "",
  hasElevator: false,
  hasBalcony: false,
  hasGarden: false,
  hasGarage: false,
  hasParking: false,
  hasInfrastructure: false,
};

const sortOptions = [
  { value: "id,desc", label: "Më të rejat" },
  { value: "price,asc", label: "Çmimi më i ulët" },
  { value: "price,desc", label: "Çmimi më i lartë" },
  { value: "area,desc", label: "Sipërfaqja më e madhe" },
  { value: "views,desc", label: "Më të shikuarat" },
];

const defaultFilterOptions = {
  locations: [],
  types: [],
  statuses: [],
  amenities: [],
};

const booleanFilters = [
  { key: "hasElevator", label: "Ashensor", types: ["BANESA"] },
  { key: "hasBalcony", label: "Ballkon", types: ["BANESA"] },
  { key: "hasGarden", label: "Oborr", types: ["SHTEPI"] },
  { key: "hasGarage", label: "Garazh", types: ["SHTEPI"] },
  { key: "hasParking", label: "Parking", types: ["LOKALE"] },
  { key: "hasInfrastructure", label: "Infrastrukturë", types: ["TOKA"] },
];

const numericFields = [
  { key: "minPrice", label: "Çmimi min.", icon: Euro, suffix: "€" },
  { key: "maxPrice", label: "Çmimi max.", icon: Euro, suffix: "€" },
  { key: "minArea", label: "Sipërfaqe min.", icon: Ruler, suffix: "m²" },
  { key: "maxArea", label: "Sipërfaqe max.", icon: Ruler, suffix: "m²" },
  { key: "minRooms", label: "Dhoma min.", icon: Bed },
  { key: "minBathrooms", label: "Banjo min.", icon: Bath },
];

const filterValueLabel = (key, value) => {
  if (!value) return "";
  if (key === "type") return typeLabels[value] || value;
  if (key === "status") return statusLabels[value] || value;
  if (key === "minPrice") return `Min ${Number(value).toLocaleString()} €`;
  if (key === "maxPrice") return `Max ${Number(value).toLocaleString()} €`;
  if (key === "minArea") return `Min ${value} m²`;
  if (key === "maxArea") return `Max ${value} m²`;
  if (key === "minRooms") return `${value}+ dhoma`;
  if (key === "minBathrooms") return `${value}+ banjo`;
  return value;
};

const buildParams = (filters, page, sort) => {
  const params = {
    page: page - 1,
    size: PAGE_SIZE,
    sort,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (typeof value === "boolean") {
      if (value) params[key] = true;
      return;
    }
    if (value !== "") params[key] = value;
  });

  return params;
};

const toOptions = (values, labels = {}) =>
  values.map((value) => ({ value, label: labels[value] || value }));

const ModernSelect = ({ icon: Icon, value, options, placeholder, onChange, className = "", allowEmpty = true }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className={`flex h-12 w-full items-center gap-2 rounded-lg border px-3 text-sm font-semibold shadow-sm outline-none transition ${
          open
            ? "border-[#D9BF7B] bg-white text-[#0F4638] ring-3 ring-[#EFD391]/20"
            : "border-[#0F4638]/10 bg-[#f9faf8] text-[#0F4638] hover:border-[#D9BF7B] hover:bg-[#f2f5ef]"
        }`}
      >
        {Icon ? <Icon size={17} className="shrink-0 text-[#D9BF7B]" /> : null}
        <span className={`min-w-0 flex-1 truncate text-left ${selected ? "text-[#0F4638]" : "text-[#0F4638]/45"}`}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-[#0F4638]/45 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-64 overflow-y-auto rounded-xl border border-[#0F4638]/10 bg-white p-1 shadow-2xl">
          {allowEmpty && (
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                value === "" ? "bg-[#0F4638] text-[#EFD391]" : "text-[#0F4638]/65 hover:bg-[#eef4ef] hover:text-[#0F4638]"
              }`}
            >
              {placeholder}
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                value === option.value ? "bg-[#0F4638] text-[#EFD391]" : "text-[#0F4638]/70 hover:bg-[#eef4ef] hover:text-[#0F4638]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AllProperties = () => {
  const [properties, setProperties] = useState([]);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState("id,desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState(defaultFilterOptions);

  const locationOptions = useMemo(() => toOptions(filterOptions.locations), [filterOptions.locations]);
  const typeOptions = useMemo(() => toOptions(filterOptions.types, typeLabels), [filterOptions.types]);
  const statusOptions = useMemo(() => toOptions(filterOptions.statuses, statusLabels), [filterOptions.statuses]);

  const visibleBooleanFilters = useMemo(() => {
    const available = new Set(filterOptions.amenities);
    const base = booleanFilters.filter((filter) => available.has(filter.key));
    if (!draftFilters.type) return base;
    return base.filter((filter) => filter.types.includes(draftFilters.type));
  }, [draftFilters.type, filterOptions.amenities]);

  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => (typeof value === "boolean" ? value : value !== ""))
      .map(([key, value]) => ({
        key,
        label: typeof value === "boolean"
          ? booleanFilters.find((filter) => filter.key === key)?.label || key
          : filterValueLabel(key, value),
      }));
  }, [filters]);

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

  useEffect(() => {
    let cancelled = false;

    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await propertyAPI.getProperties(buildParams(filters, page, sort));
        const data = res.data;

        if (cancelled) return;

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
        if (!cancelled) {
          setProperties([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();
    return () => {
      cancelled = true;
    };
  }, [filters, page, sort]);

  useEffect(() => {
    let cancelled = false;

    const fetchFilterOptions = async () => {
      try {
        const res = await propertyAPI.getFilterOptions();
        if (!cancelled) setFilterOptions({ ...defaultFilterOptions, ...res.data });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateDraft = (key, value) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = (event) => {
    event.preventDefault();
    setFilters(draftFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setPage(1);
  };

  const removeFilter = (key) => {
    const value = typeof filters[key] === "boolean" ? false : "";
    const next = { ...filters, [key]: value };
    setFilters(next);
    setDraftFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[#f6f7f4]">
      <section className="border-b border-[#0F4638]/10 bg-white">
        <form onSubmit={applyFilters} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#0F4638]/55">Ari Real Estate</p>
              <h1 className="mt-1 text-2xl font-bold text-[#071f1a]">Kërko prona</h1>
            </div>
            <ModernSelect
              icon={ListFilter}
              value={sort}
              options={sortOptions}
              placeholder="Renditja"
              allowEmpty={false}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
              className="w-full sm:w-64"
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_180px_180px_160px]">
            <label className="flex h-12 items-center gap-2 rounded-lg border border-[#0F4638]/10 bg-[#f9faf8] px-3 text-sm text-[#0F4638] transition hover:border-[#D9BF7B] hover:bg-[#f2f5ef] focus-within:border-[#D9BF7B] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#EFD391]/20">
              <Search size={17} className="text-[#D9BF7B]" />
              <input
                value={draftFilters.q}
                onChange={(event) => updateDraft("q", event.target.value)}
                placeholder="Kërko titull, lagje, qytet..."
                className="w-full bg-transparent text-[#0F4638] outline-none placeholder:text-[#0F4638]/35"
              />
            </label>

            <ModernSelect
              icon={MapPin}
              value={draftFilters.location}
              options={locationOptions}
              placeholder="Qyteti"
              onChange={(value) => updateDraft("location", value)}
            />

            <ModernSelect
              icon={Building2}
              value={draftFilters.type}
              options={typeOptions}
              placeholder="Lloji"
              onChange={(value) => updateDraft("type", value)}
            />

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#EFD391] px-5 text-sm font-bold text-black transition hover:bg-[#D9BF7B]"
            >
              <Search size={16} /> Kërko
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex w-full rounded-lg border border-[#0F4638]/10 bg-[#f9faf8] p-1 sm:w-auto sm:min-w-80">
              {[{ value: "", label: "Të gjitha" }, ...statusOptions].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateDraft("status", value)}
                  className={`h-10 flex-1 rounded-md text-sm font-semibold transition ${
                    draftFilters.status === value ? "bg-[#0F4638] text-[#EFD391]" : "text-[#0F4638]/65 hover:bg-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowMoreFilters((current) => !current)}
              className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-bold transition ${
                showMoreFilters
                  ? "border-[#EFD391] bg-[#EFD391]/20 text-[#0F4638]"
                  : "border-[#0F4638]/10 bg-white text-[#0F4638] hover:border-[#D9BF7B]"
              }`}
            >
              <SlidersHorizontal size={16} />
              {showMoreFilters ? "Mbyll filtrat" : "Më shumë filtra"}
            </button>

            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto inline-flex h-9 items-center gap-1 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
              >
                <X size={14} /> Pastro
              </button>
            )}
          </div>

          {showMoreFilters && (
            <div className="mt-4 rounded-xl border border-[#0F4638]/10 bg-[#f9faf8] p-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {numericFields.map(({ key, label, icon: Icon, suffix }) => (
                  <label key={key} className="flex h-12 items-center gap-2 rounded-lg border border-[#0F4638]/10 bg-white px-3 text-sm text-[#0F4638] focus-within:border-[#D9BF7B]">
                    <Icon size={16} className="text-[#D9BF7B]" />
                    <input
                      type="number"
                      min="0"
                      value={draftFilters[key]}
                      onChange={(event) => updateDraft(key, event.target.value)}
                      placeholder={label}
                      className="w-full bg-transparent outline-none placeholder:text-[#0F4638]/35"
                    />
                    {suffix ? <span className="text-xs font-semibold text-[#0F4638]/45">{suffix}</span> : null}
                  </label>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#0F4638]/45">
                  <SlidersHorizontal size={14} /> Detaje
                </span>
                {visibleBooleanFilters.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => updateDraft(filter.key, !draftFilters[filter.key])}
                    className={`inline-flex h-9 items-center rounded-lg border px-3 text-sm font-semibold transition ${
                      draftFilters[filter.key]
                        ? "border-[#EFD391] bg-[#EFD391]/25 text-[#0F4638]"
                        : "border-[#0F4638]/10 bg-white text-[#0F4638]/60 hover:border-[#D9BF7B]"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0F4638]">
              {loading ? "Duke kërkuar..." : `${totalElements} prona të gjetura`}
            </p>
            {!loading && totalPages > 1 && (
              <p className="mt-0.5 text-xs text-[#0F4638]/45">Faqja {page} nga {totalPages}</p>
            )}
          </div>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#EFD391]/40 bg-white px-3 text-xs font-semibold text-[#0F4638]"
                >
                  {filter.label}
                  <X size={12} />
                </button>
              ))}
            </div>
          )}
        </div>

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

export default AllProperties;

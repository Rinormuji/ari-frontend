// src/admin/PropertiesAdmin.jsx
import React, { useEffect, useState, useMemo } from "react";
import { LayoutGrid, Table2, Trash2, Pencil, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { propertyAPI, api } from "../../services/api";
import { useToast } from "../../context/ToastContext";

// const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const defaultPageSize = 12;

const typeBadge = {
  BANESA: "bg-blue-500/15 text-blue-300",
  SHTEPI: "bg-emerald-500/15 text-emerald-300",
  LOKALE: "bg-purple-500/15 text-purple-300",
  TOKA: "bg-amber-500/15 text-amber-300",
};
const typeLabel = { BANESA: "Banesa", SHTEPI: "Shtëpi", LOKALE: "Lokale", TOKA: "Tokë" };

export default function PropertiesAdmin() {
  const navigate = useNavigate();
  const toast = useToast();

  const [view, setView] = useState("table"); // "table" or "cards"
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const [error, setError] = useState(null);

const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [propertyToDelete, setPropertyToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);


  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // fetch from backend (paged)
  useEffect(() => {
    let cancelled = false;
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await propertyAPI.getProperties({
        page: page - 1,
        size: pageSize,
      });
        // const url = `${API_BASE}/api/properties?page=${Math.max(0, page - 1)}&size=${pageSize}`;
        // const res = await axios.get(url, { withCredentials: true });
//        const res = await axios.get(`${API_BASE}/api/properties?page=${page-1}&size=${pageSize}`, { withCredentials: true });
// console.log(res.data);

        // Expecting Spring Page structure (content + totalPages), or fallback array
        const data = res.data;
        let content = [];
        let tp = 1;
        if (Array.isArray(data)) {
          content = data;
          tp = 1;
        } else if (data.content) {
          content = data.content;
          tp = data.totalPages ?? 1;
        } else {
          // defensive: try to treat response as array
          content = data.items ?? [];
          tp = data.totalPages ?? 1;
        }

        // map properties safely (handle BigDecimal, nulls)
        const mapped = content.map((p) => ({
          id: p.id,
          title: p.title,
          location: p.location,
          city: (p.location && p.location.split(",")[0]?.trim()) || "",
          neighborhood: (p.location && p.location.split(",")[1]?.trim()) || "",
          type: p.type,
          status: p.status,
          area: (p.area !== undefined && p.area !== null) ? Number(p.area) : null,
          price: (p.price !== undefined && p.price !== null) ? Number(p.price) : null,
          rooms: p.rooms ?? (p.rooms === 0 ? 0 : null),
          floor: p.floor ?? null,
          bathrooms: p.bathrooms ?? null,
          hasElevator: p.hasElevator ?? false,
          hasBalcony: p.hasBalcony ?? false,
          hasGarage: p.hasGarage ?? false,
          hasGarden: p.hasGarden ?? false,
          hasParking: p.hasParking ?? false,
          hasInfrastructure: p.hasInfrastructure ?? false,
          images: Array.isArray(p.images) ? p.images : [],
          raw: p,
        }));

        if (!cancelled) {
          setProperties(mapped);
          setTotalPages(tp);
        }
      } catch (e) {
        console.error("Error fetching properties:", e);
        setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProperties();
    return () => { cancelled = true; };
  }, [page, pageSize]);

  // client-side filters
  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        if (!(
          String(p.title || "").toLowerCase().includes(s) ||
          String(p.city || "").toLowerCase().includes(s) ||
          String(p.neighborhood || "").toLowerCase().includes(s)
        )) return false;
      }
      if (typeFilter && p.type !== typeFilter) return false;
      if (statusFilter && p.status !== statusFilter) return false;
      if (cityFilter && (!p.city || p.city !== cityFilter)) return false;
      if (minPrice && (p.price === null || Number(p.price) < Number(minPrice))) return false;
      if (maxPrice && (p.price === null || Number(p.price) > Number(maxPrice))) return false;
      if (minArea && (p.area === null || Number(p.area) < Number(minArea))) return false;
      if (maxArea && (p.area === null || Number(p.area) > Number(maxArea))) return false;
      return true;
    });
  }, [properties, debouncedSearch, typeFilter, statusFilter, minPrice, maxPrice, minArea, maxArea, cityFilter]);

  // helper: delete property
  const handleDelete = (id) => {
  setPropertyToDelete(id);
  setDeleteModalOpen(true);
};

const confirmDelete = async () => {
  if (!propertyToDelete) return;

  try {
    setDeleting(true);
    await api.delete(`/properties/${propertyToDelete}`);

    setProperties((prev) =>
      prev.filter((p) => p.id !== propertyToDelete)
    );

    setDeleteModalOpen(false);
    setPropertyToDelete(null);
    toast.success("Prona u fshi me sukses.");
  } catch (e) {
    console.error("Delete error:", e);
    toast.error("Fshirja dështoi.");
  } finally {
    setDeleting(false);
  }
};


  // helper: navigate to edit - route should exist
  const handleEdit = (id) => {
    navigate(`/admin/properties/edit/${id}`);
  };

  // distinct city options for filters
  const cityOptions = useMemo(() => {
    const s = new Set(properties.map((p) => p.city).filter(Boolean));
    return Array.from(s);
  }, [properties]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-white">Menaxhimi i Pronave</h1>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 gap-2 flex-1 sm:w-72">
            <Search size={14} className="text-white/40 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko titull, qytet..."
              className="bg-transparent text-white text-sm outline-none w-full placeholder-white/30"
            />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-white/40" /></button>}
          </div>
          {/* View toggle */}
          <button onClick={() => setView("table")} className={`p-2 rounded-lg border transition-colors ${view === "table" ? "bg-[#FFAE42]/15 border-[#FFAE42]/30 text-[#FFAE42]" : "border-white/10 text-white/40 hover:text-white"}`}>
            <Table2 size={17} />
          </button>
          <button onClick={() => setView("cards")} className={`p-2 rounded-lg border transition-colors ${view === "cards" ? "bg-[#FFAE42]/15 border-[#FFAE42]/30 text-[#FFAE42]" : "border-white/10 text-white/40 hover:text-white"}`}>
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { value: typeFilter, onChange: setTypeFilter, options: [["", "Të gjitha llojet"], ["BANESA","Banesa"], ["SHTEPI","Shtëpi"], ["LOKALE","Lokale"], ["TOKA","Tokë"]] },
          { value: statusFilter, onChange: setStatusFilter, options: [["","Të gjitha statuset"],["FOR_SALE","Në shitje"],["FOR_RENT","Me qira"]] },
        ].map((f, i) => (
          <select key={i} value={f.value} onChange={(e) => f.onChange(e.target.value)}
            className="bg-[#1a1a1a] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFAE42]/40">
            {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFAE42]/40">
          <option value="">Të gjitha qytetet</option>
          {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input placeholder="Min €" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number"
          className="w-24 bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder-white/30 focus:outline-none focus:border-[#FFAE42]/40" />
        <input placeholder="Max €" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number"
          className="w-24 bg-[#1a1a1a] border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder-white/30 focus:outline-none focus:border-[#FFAE42]/40" />
        {(typeFilter || statusFilter || cityFilter || minPrice || maxPrice || search) && (
          <button onClick={() => { setTypeFilter(""); setStatusFilter(""); setCityFilter(""); setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea(""); setSearch(""); }}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-2 transition-colors">
            <X size={13} /> Pastro
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center">Gabim gjatë marrjes së pronave.</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/40 py-8 text-center">Nuk u gjetën prona.</div>
      ) : view === "table" ? (
        <div className="bg-[#111111] rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-175">
            <thead>
              <tr className="border-b border-white/10">
                {["ID", "Titulli", "Qyteti", "Lloji", "Statusi", "Çmimi", "m²", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white/40 text-xs font-mono">{p.id}</td>
                  <td className="px-4 py-3 text-white font-medium max-w-50 truncate">{p.title}</td>
                  <td className="px-4 py-3 text-white/60">{p.city || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeBadge[p.type] || "bg-white/10 text-white/60"}`}>
                      {typeLabel[p.type] || p.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.status === "FOR_SALE" ? "bg-green-500/15 text-green-300" : "bg-blue-500/15 text-blue-300"}`}>
                      {p.status === "FOR_SALE" ? "Shitje" : "Qira"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/80">{p.price !== null ? Number(p.price).toLocaleString() + " €" : "—"}</td>
                  <td className="px-4 py-3 text-white/60">{p.area !== null ? `${p.area} m²` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FFAE42]/15 hover:text-[#FFAE42] text-white/50 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-white font-medium text-sm leading-snug">{p.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ""}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${p.status === "FOR_SALE" ? "bg-green-500/15 text-green-300" : "bg-blue-500/15 text-blue-300"}`}>
                  {p.status === "FOR_SALE" ? "Shitje" : "Qira"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadge[p.type] || "bg-white/10 text-white/60"}`}>{typeLabel[p.type]}</span>
                {p.rooms ? <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">{p.rooms} dhoma</span> : null}
                {p.area ? <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/50">{p.area} m²</span> : null}
              </div>
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                <span className="text-[#FFAE42] font-semibold text-sm">{p.price !== null ? Number(p.price).toLocaleString() + " €" : "—"}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FFAE42]/15 hover:text-[#FFAE42] text-white/50 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
          ← Prev
        </button>
        <span className="text-sm text-white/50">Faqja {page} / {totalPages}</span>
        <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">
          Next →
        </button>
        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          className="bg-[#1a1a1a] border border-white/10 text-white/60 text-sm rounded-lg px-2 py-1.5 focus:outline-none">
          {[6, 12, 24].map((n) => <option key={n} value={n}>{n}/faqe</option>)}
        </select>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Konfirmo fshirjen</h3>
            <p className="text-white/60 text-sm mb-6">A je i sigurt që dëshiron të fshish këtë pronë? Ky veprim nuk mund të kthehet mbrapsht.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setDeleteModalOpen(false); setPropertyToDelete(null); }} disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors disabled:opacity-50">
                Anulo
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors disabled:opacity-50">
                {deleting ? "Duke fshirë..." : "Fshij"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


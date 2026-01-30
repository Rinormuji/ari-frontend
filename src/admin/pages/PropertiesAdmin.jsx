// src/admin/PropertiesAdmin.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaThLarge, FaTable, FaTrashAlt, FaEdit, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * PropertiesAdmin
 * - fetch real nga backend: GET /api/properties?page=...&size=...
 * - filtrat, search, pagination, toggle view (table/cards)
 * - delete (DELETE /api/properties/:id) + optimistic refresh
 *
 * Config:
 * - API base: process.env.REACT_APP_API_BASE || "http://localhost:8080"
 *
 * NOTE: nëse backend ka një endpoint të ndryshëm për fshirje/ndryshim,
 * ndrysho axios.delete(...) sipas nevojës.
 */

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const defaultPageSize = 12;

const StatusBadge = ({ status }) => (
  <span className={`status-badge ${status === "FOR_SALE" ? "status-sale" : "status-rent"}`}>
    {status === "FOR_SALE" ? "Shitje" : "Qira"}
  </span>
);

const SmallMeta = ({ children }) => <div style={{ color: "#cbd5e1", fontSize: 13 }}>{children}</div>;

export default function PropertiesAdmin() {
  const navigate = useNavigate();

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
        const url = `${API_BASE}/api/properties?page=${Math.max(0, page - 1)}&size=${pageSize}`;
        const res = await axios.get(url, { withCredentials: true });
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
    await axios.delete(`${API_BASE}/api/properties/${propertyToDelete}`, {
      withCredentials: true,
    });

    setProperties((prev) =>
      prev.filter((p) => p.id !== propertyToDelete)
    );

    setDeleteModalOpen(false);
    setPropertyToDelete(null);
  } catch (e) {
    console.error("Delete error:", e);
    alert("Fshirja dështoi.");
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
    <div className="admin-page-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Menaxhimi i Pronave</h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 gap-2">
            <FaSearch className="text-white" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kerko me titull, qytet..."
              className="filter-input"
              style={{ width: 280 }}
            />
          </div>

          <div className="flex gap-2">
            <button
              className={`p-2 rounded-md border shadow-sm transition-all duration-200 ${view === "table" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setView("table")}
              title="Table View"
            >
              <FaTable size={18} />
            </button>
            <button
              className={`p-2 rounded-md border shadow-sm transition-all duration-200 ${view === "cards" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"}`}
              onClick={() => setView("cards")}
              title="Card View"
            >
              <FaThLarge size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-container-admin">
        <select className="filter-select-admin" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">Të gjitha llojet</option>
          <option value="BANESA">Banesa</option>
          <option value="SHTEPI">Shtëpi</option>
          <option value="LOKALE">Lokale</option>
          <option value="TOKA">Tokë</option>
        </select>

        <select className="filter-select-admin" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Të gjitha statuset</option>
          <option value="FOR_SALE">Në shitje</option>
          <option value="FOR_RENT">Me qira</option>
        </select>

        <select className="filter-select-admin" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
          <option value="">Të gjitha qytetet</option>
          {cityOptions.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>

        <input className="filter-input-admin" placeholder="Min çmimi" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} type="number" />
        <input className="filter-input-admin" placeholder="Max çmimi" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} type="number" />

        {/* <input className="filter-input-admin" placeholder="Min m²" value={minArea} onChange={(e) => setMinArea(e.target.value)} type="number" /> */}
        <input className="filter-input-admin" placeholder="Max m²" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} type="number" />

        <button className="filter-button-admin" onClick={() => { setTypeFilter(""); setStatusFilter(""); setCityFilter(""); setMinPrice(""); setMaxPrice(""); setMinArea(""); setMaxArea(""); setSearch(""); }}>
          Pastro filtra
        </button>
      </div>

      {/* CONTENT */}
      <div className="mt-6 properties-view-container">
        {loading ? (
          <div className="properties-table-container">
            <div style={{ display: "grid", gap: 12 }}>
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: 48, background: "#111", borderRadius: 6 }} />)}
            </div>
          </div>
        ) : error ? (
          <div className="properties-table-container p-4 text-white">
            Gabim gjatë marrjes së pronave. Shiko console për detaje.
          </div>
        ) : view === "table" ? (
          <div className="properties-table-container">
            <table className="properties-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Titulli</th>
                  <th>Qyteti</th>
                  <th>Lloji</th>
                  <th>Statusi</th>
                  <th>Çmimi</th>
                  <th>Sipërfaqe</th>
                  <th>Detaje</th>
                  <th>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td style={{ maxWidth: 240 }}>{p.title}</td>
                    <td>{p.city}</td>
                    <td>{p.type}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{p.price !== null ? Number(p.price).toLocaleString() + " €" : "-"}</td>
                    <td>{p.area !== null ? `${p.area} m²` : "-"}</td>
                    <td>
                    <SmallMeta>
                        {p.rooms ? `${p.rooms} dhoma · ` : ""}
                        { (p.type === "BANESA" || p.type === "LOKALE") && p.floor ? `Kati ${p.floor}` : "" }
                        { p.type === "SHTEPI" && p.floor ? `${p.floor} Kate` : "" }
                    </SmallMeta>

                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="action-button action-edit" onClick={() => handleEdit(p.id)} title="Edit">
                          <FaEdit />
                        </button>
                        <button className="action-button action-delete" onClick={() => handleDelete(p.id)} title="Delete">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="properties-cards-grid">
            {filtered.map((p) => (
              <div key={p.id} className="property-card-admin">
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <h3>{p.title}</h3>
                    <div>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                  <SmallMeta>{p.city} · {p.type}</SmallMeta>

                  <p style={{ marginTop: 12, fontWeight: 700, color: "#60a5fa" }}>
                    {p.price !== null ? Number(p.price).toLocaleString() + " €" : "-"}
                  </p>

                  <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
  {p.rooms ? <div className="chip">🛏 {p.rooms}</div> : null}

  {/* Floor / Kate */}
  {(p.type === "BANESA" || p.type === "LOKALE") && p.floor ? (
    <div className="chip">⬛ Kati {p.floor}</div>
  ) : p.type === "SHTEPI" && p.floor ? (
    <div className="chip">⬛ {p.floor} Kate</div>
  ) : null}

  {p.hasElevator ? <div className="chip">🔼 Ashensor</div> : null}
  {p.hasBalcony ? <div className="chip">🌇 Ballkon</div> : null}
  {p.hasGarage ? <div className="chip">🚗 Garazh</div> : null}
  {p.hasGarden ? <div className="chip">🌳 Oborr</div> : null}
  {p.hasParking ? <div className="chip">🅿️ Parking</div> : null}
</div>

                </div>

                <div className="actions" style={{ marginTop: 12 }}>
                  <button className="action-button action-edit" onClick={() => handleEdit(p.id)}><FaEdit /></button>
                  <button className="action-button action-delete" onClick={() => handleDelete(p.id)}><FaTrashAlt /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button
          onClick={() => setPage((s) => Math.max(1, s - 1))}
          className="filter-button"
          disabled={page <= 1}
        >
          Prev
        </button>

        <div style={{ color: "#cbd5e1" }}>
          Faqja {page} / {totalPages}
        </div>

        <button
          onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
          className="filter-button"
          disabled={page >= totalPages}
        >
          Next
        </button>

        <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="filter-select">
          <option value={6}>6</option>
          <option value={12}>12</option>
          <option value={24}>24</option>
        </select>
      </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-3 mt-6">
        ...
      </div>

      {deleteModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Konfirmo fshirjen</h3>
            <p>
              A je i sigurt që dëshiron të fshish këtë pronë?
              <br />
              <span>Kjo veprim nuk mund të kthehet mbrapsht.</span>
            </p>

            <div className="admin-modal-actions">
              <button
                className="admin-modal-btn cancel"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setPropertyToDelete(null);
                }}
                disabled={deleting}
              >
                Anulo
              </button>

              <button
                className="admin-modal-btn delete"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? "Duke fshirë..." : "Fshij"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chip {
          border: 1px solid rgba(255,255,255,0.08);
          padding: 6px 8px;
          border-radius: 999px;
          font-size: 13px;
          color: #e6eef8;
          background: rgba(255,255,255,0.02);
        }
      `}</style>

    </div>
  );
}

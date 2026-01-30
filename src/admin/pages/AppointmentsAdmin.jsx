import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { FaThLarge, FaTable, FaSearch, FaCheck, FaTimes, FaEye } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const defaultPageSize = 12;

const StatusBadge = ({ status }) => {
  let color = "";
  let text = "";
  switch (status) {
    case "PENDING":
      color = "status-pending";
      text = "Në pritje";
      break;
    case "APPROVED":
      color = "status-approved";
      text = "Aprovuar";
      break;
    case "REJECTED":
      color = "status-rejected";
      text = "Refuzuar";
      break;
    default:
      color = "";
      text = status;
  }
  return <span className={`status-badge ${color}`}>{text}</span>;
};

export default function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // FETCH APPOINTMENTS - E përmirësuar me Token dhe Header
  useEffect(() => {
    let cancelled = false;
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token"); // Merret tokeni
        const res = await axios.get(`${API_BASE}/api/appointments`, {
          params: { 
            page: Math.max(0, page - 1), 
            size: pageSize,
            search: debouncedSearch || undefined 
          },
          headers: { 
            Authorization: `Bearer ${token}` // Shtohet Authorization header
          },
          withCredentials: true,
        });

        const data = res.data;
        let content = data.content || (Array.isArray(data) ? data : []);
        let tp = data.totalPages ?? 1;

        const mapped = content.map((a) => ({
          id: a.id,
          propertyName: a.propertyTitle ?? a.propertyName ?? "-",
          propertyId: a.propertyId ?? null,
          user: a.username ?? a.userEmail ?? "-",
          date: a.date ?? "-",
          status: a.status ?? "PENDING",
          raw: a,
        }));

        if (!cancelled) {
          setAppointments(mapped);
          setTotalPages(tp);
        }
      } catch (e) {
        console.error("Error fetching appointments:", e);
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAppointments();
    return () => { cancelled = true; };
  }, [page, pageSize, debouncedSearch]);

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      // Filtrimi sipas statusit
      if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
  
      // Filtrimi sipas kërkimit (Search)
      if (debouncedSearch) {
        const s = debouncedSearch.toLowerCase();
        const matchesProperty = String(a.propertyName).toLowerCase().includes(s);
        const matchesUser = String(a.user).toLowerCase().includes(s);
        const matchesDate = String(a.date).toLowerCase().includes(s);

        if (!matchesProperty && !matchesUser && !matchesDate) return false;
      }
  
      return true;
    });
  }, [appointments, filterStatus, debouncedSearch]); 

  const formatDate = (d) => {
    if (!d || d === "-") return "-";
    const dt = new Date(d);
    return dt.toLocaleString("sq-AL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // UPDATE STATUS - E përmirësuar me Token
  const updateStatus = async (id, status) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = status === "APPROVED" ? "approve" : "reject";
      
      await axios.put(`${API_BASE}/api/appointments/${id}/${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
  
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Nuk mund të ndryshohet statusi.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openModal = (appointment) => { setSelectedAppointment(appointment); setModalOpen(true); };
  const closeModal = () => { setSelectedAppointment(null); setModalOpen(false); };
  const openConfirmModal = (id, status) => { setConfirmAction({ id, status }); setConfirmOpen(true); };
  const closeConfirmModal = () => { setConfirmAction(null); setConfirmOpen(false); };
  
  const handleConfirm = () => {
    if (confirmAction) {
      updateStatus(confirmAction.id, confirmAction.status);
      closeConfirmModal();
    }
  };

  return (
    <div className="admin-page-container p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Menaxhimi i Termineve</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-800 rounded-lg px-3 py-2 gap-2">
            <FaSearch className="text-white" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kërko pronë ose përdorues"
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

      <div className="filters-container-admin">
        <select className="filter-select-admin" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Të gjitha statuset</option>
          <option value="PENDING">Në pritje</option>
          <option value="APPROVED">Aprovuar</option>
          <option value="REJECTED">Refuzuar</option>
        </select>
        <button className="filter-button-admin" onClick={() => { setFilterStatus("ALL"); setSearch(""); }}>Pastro filtra</button>
      </div>

      <div className="mt-6 properties-view-container">
        {loading ? (
          <div className="properties-table-container text-white p-4">Duke u ngarkuar...</div>
        ) : error ? (
          <div className="properties-table-container p-4 text-white">Gabim gjatë marrjes së termineve.</div>
        ) : view === "table" ? (
          <div className="properties-table-container">
            <table className="properties-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Prona</th>
                  <th>Përdoruesi</th>
                  <th>Data</th>
                  <th>Statusi</th>
                  <th>Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>{a.propertyName} (#{a.propertyId})</td>
                    <td>{a.user}</td>
                    <td>{formatDate(a.date)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {a.status === "PENDING" && (
                          <>
                            <button className="action-button action-approve" onClick={() => openConfirmModal(a.id, "APPROVED")} disabled={updatingStatus}><FaCheck /></button>
                            <button className="action-button action-reject" onClick={() => openConfirmModal(a.id, "REJECTED")} disabled={updatingStatus}><FaTimes /></button>
                          </>
                        )}
                        <button className="action-button action-view" onClick={() => openModal(a)}><FaEye /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="properties-cards-grid">
            {filtered.map((a) => (
              <div key={a.id} className="property-card-admin">
                <h3>{a.propertyName}</h3>
                <p>{a.user}</p>
                <p>{formatDate(a.date)}</p>
                <StatusBadge status={a.status} />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  {a.status === "PENDING" && (
                    <>
                      <button className="action-button action-approve" onClick={() => openConfirmModal(a.id, "APPROVED")} disabled={updatingStatus}><FaCheck /></button>
                      <button className="action-button action-reject" onClick={() => openConfirmModal(a.id, "REJECTED")} disabled={updatingStatus}><FaTimes /></button>
                    </>
                  )}
                  <button className="action-button action-view" onClick={() => openModal(a)}><FaEye /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 mt-6">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} className="filter-button" disabled={page <= 1}>Prev</button>
        <div style={{ color: "#cbd5e1" }}>Faqja {page} / {totalPages}</div>
        <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} className="filter-button" disabled={page >= totalPages}>Next</button>
      </div>

      {modalOpen && selectedAppointment && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Detajet e Takimit</h3>
            <p><strong>ID:</strong> {selectedAppointment.id}</p>
            <p><strong>Prona:</strong> {selectedAppointment.propertyName}</p>
            <p><strong>Përdoruesi:</strong> {selectedAppointment.user}</p>
            <p><strong>Data:</strong> {formatDate(selectedAppointment.date)}</p>
            <p><strong>Statusi:</strong> <StatusBadge status={selectedAppointment.status} /></p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn cancel" onClick={closeModal}>Mbyll</button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && confirmAction && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Konfirmim Veprimi</h3>
            <p>A jeni i sigurt që dëshironi të {confirmAction.status === "APPROVED" ? "aprovoni" : "refuzoni"} këtë takim?</p>
            <div className="admin-modal-actions">
              <button className="admin-modal-btn cancel" onClick={closeConfirmModal}>Anulo</button>
              <button className="admin-modal-btn confirm" onClick={handleConfirm}>Po, konfirmo</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .status-pending { background: #facc15; color: #111; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .status-approved { background: #22c55e; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .status-rejected { background: #ef4444; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
        .action-button { padding: 4px 6px; border: none; border-radius: 4px; cursor: pointer; color: white; background: #374151; }
        .action-approve { background: #22c55e; }
        .action-reject { background: #ef4444; }
        .action-view { background: #3b82f6; }
        .admin-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; backdrop-filter: blur(6px); background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999; }
        .admin-modal { background: #1f2937; color: #fff; padding: 20px 24px; border-radius: 10px; max-width: 400px; width: 90%; text-align: center; }
        .admin-modal-actions { display: flex; justify-content: space-around; margin-top: 20px; }
        .admin-modal-btn { padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .admin-modal-btn.cancel { background: #374151; color: #fff; }
        .admin-modal-btn.confirm { background: #22c55e; color: #fff; }
      `}</style>
    </div>
  );
}
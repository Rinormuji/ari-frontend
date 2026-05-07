import React, { useEffect, useState, useMemo } from "react";
import api from "../../services/api";
import { LayoutGrid, Table2, Search, Check, X, Eye } from "lucide-react";
import { useToast } from "../../context/ToastContext";
const defaultPageSize = 12;

const statusCfg = {
  PENDING:  { cls: "bg-yellow-400/15 text-yellow-300", label: "Në pritje" },
  APPROVED: { cls: "bg-green-500/15 text-green-300",  label: "Aprovuar" },
  REJECTED: { cls: "bg-red-500/15 text-red-400",     label: "Refuzuar" },
};
const StatusBadge = ({ status }) => {
  const cfg = statusCfg[status] || { cls: "bg-white/10 text-white/60", label: status };
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

export default function AppointmentsAdmin() {
  const toast = useToast();
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
        const res = await api.get(`/appointments`, {
          params: { 
            page: Math.max(0, page - 1), 
            size: pageSize,
            search: debouncedSearch || undefined 
          },
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
      const endpoint = status === "APPROVED" ? "approve" : "reject";
      
      await api.put(`/appointments/${id}/${endpoint}`, {});
  
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success(status === "APPROVED" ? "Takimi u aprovua." : "Takimi u refuzua.");
    } catch (e) {
      console.error("Error updating status:", e);
      toast.error("Nuk mund të ndryshohet statusi.");
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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-white">Menaxhimi i Termineve</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 gap-2 flex-1 sm:w-72">
            <Search size={14} className="text-white/40 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kërko pronë ose përdorues..."
              className="bg-transparent text-white text-sm outline-none w-full placeholder-white/30" />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-white/40" /></button>}
          </div>
          <button onClick={() => setView("table")} className={`p-2 rounded-lg border transition-colors ${view === "table" ? "bg-[#FFAE42]/15 border-[#FFAE42]/30 text-[#FFAE42]" : "border-white/10 text-white/40 hover:text-white"}`}><Table2 size={17} /></button>
          <button onClick={() => setView("cards")} className={`p-2 rounded-lg border transition-colors ${view === "cards" ? "bg-[#FFAE42]/15 border-[#FFAE42]/30 text-[#FFAE42]" : "border-white/10 text-white/40 hover:text-white"}`}><LayoutGrid size={17} /></button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-white/10 text-white/70 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFAE42]/40">
          <option value="ALL">Të gjitha statuset</option>
          <option value="PENDING">Në pritje</option>
          <option value="APPROVED">Aprovuar</option>
          <option value="REJECTED">Refuzuar</option>
        </select>
        {(filterStatus !== "ALL" || search) && (
          <button onClick={() => { setFilterStatus("ALL"); setSearch(""); }}
            className="flex items-center gap-1 text-sm text-white/50 hover:text-white border border-white/10 rounded-lg px-3 py-2 transition-colors">
            <X size={13} /> Pastro
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}</div>
      ) : error ? (
        <div className="text-red-400 py-8 text-center">Gabim gjatë marrjes së termineve.</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/40 py-8 text-center">Nuk u gjetën termine.</div>
      ) : view === "table" ? (
        <div className="bg-[#111111] rounded-xl border border-white/10 overflow-x-auto">
          <table className="w-full text-sm min-w-150">
            <thead>
              <tr className="border-b border-white/10">
                {["ID", "Prona", "Përdoruesi", "Data", "Statusi", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white/40 text-xs font-mono">{a.id}</td>
                  <td className="px-4 py-3 text-white">{a.propertyName}</td>
                  <td className="px-4 py-3 text-white/60">{a.user}</td>
                  <td className="px-4 py-3 text-white/60 text-xs">{formatDate(a.date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {a.status === "PENDING" && (
                        <>
                          <button onClick={() => openConfirmModal(a.id, "APPROVED")} disabled={updatingStatus}
                            className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50"><Check size={14} /></button>
                          <button onClick={() => openConfirmModal(a.id, "REJECTED")} disabled={updatingStatus}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"><X size={14} /></button>
                        </>
                      )}
                      <button onClick={() => openModal(a)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Eye size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="bg-[#111111] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <p className="text-white font-medium text-sm">{a.propertyName}</p>
                <StatusBadge status={a.status} />
              </div>
              <p className="text-white/50 text-xs mb-1">{a.user}</p>
              <p className="text-white/40 text-xs mb-4">{formatDate(a.date)}</p>
              <div className="flex gap-2 pt-2 border-t border-white/5">
                {a.status === "PENDING" && (
                  <>
                    <button onClick={() => openConfirmModal(a.id, "APPROVED")} disabled={updatingStatus}
                      className="p-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-colors disabled:opacity-50"><Check size={14} /></button>
                    <button onClick={() => openConfirmModal(a.id, "REJECTED")} disabled={updatingStatus}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"><X size={14} /></button>
                  </>
                )}
                <button onClick={() => openModal(a)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Eye size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">← Prev</button>
        <span className="text-sm text-white/50">Faqja {page} / {totalPages}</span>
        <button onClick={() => setPage((s) => Math.min(totalPages, s + 1))} disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">Next →</button>
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4">Detajet e Takimit</h3>
            {[
              ["ID", selectedAppointment.id],
              ["Prona", selectedAppointment.propertyName],
              ["Përdoruesi", selectedAppointment.user],
              ["Data", formatDate(selectedAppointment.date)],
            ].map(([l, v]) => (
              <div key={l} className="flex gap-2 mb-2">
                <span className="text-white/40 text-sm w-24 shrink-0">{l}:</span>
                <span className="text-white text-sm">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 mb-4">
              <span className="text-white/40 text-sm w-24 shrink-0">Statusi:</span>
              <StatusBadge status={selectedAppointment.status} />
            </div>
            <div className="flex justify-end">
              <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">Mbyll</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmOpen && confirmAction && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-2">Konfirmim Veprimi</h3>
            <p className="text-white/60 text-sm mb-6">A jeni i sigurt që dëshironi të {confirmAction.status === "APPROVED" ? "aprovoni" : "refuzoni"} këtë takim?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={closeConfirmModal} className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">Anulo</button>
              <button onClick={handleConfirm} className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${confirmAction.status === "APPROVED" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"}`}>
                Po, konfirmo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

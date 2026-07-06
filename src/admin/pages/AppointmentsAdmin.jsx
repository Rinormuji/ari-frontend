import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  Edit3,
  Eye,
  LayoutGrid,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { appointmentAPI, propertyAPI, usersAPI } from "../../services/api";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 12;

const emptyForm = {
  id: null,
  username: "",
  propertyId: "",
  date: "",
  status: "PENDING",
};

const statusCfg = {
  PENDING: { cls: "bg-yellow-400/15 text-yellow-300", label: "Në pritje" },
  APPROVED: { cls: "bg-green-500/15 text-green-300", label: "Aprovuar" },
  REJECTED: { cls: "bg-red-500/15 text-red-400", label: "Refuzuar" },
};

const StatusBadge = ({ status }) => {
  const cfg = statusCfg[status] || { cls: "bg-white/10 text-white/60", label: status || "-" };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>;
};

const toDateTimeInput = (value) => {
  if (!value || value === "-") return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

export default function AppointmentsAdmin() {
  const toast = useToast();

  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await appointmentAPI.getAll({
        page: Math.max(0, page - 1),
        size: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });

      const data = res.data;
      const content = data?.content || (Array.isArray(data) ? data : []);
      setAppointments(content.map((appointment) => ({
        id: appointment.id,
        propertyName: appointment.propertyTitle ?? appointment.propertyName ?? "-",
        propertyId: appointment.propertyId ?? null,
        user: appointment.username ?? appointment.userEmail ?? "-",
        date: appointment.date ?? "-",
        status: appointment.status ?? "PENDING",
        raw: appointment,
      })));
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormOptions = async () => {
    try {
      const [usersRes, propertiesRes] = await Promise.all([
        usersAPI.getUsers({ page: 0, size: 500, search: "" }),
        propertyAPI.getProperties({ page: 0, size: 500, sort: "id,desc" }),
      ]);

      const userData = usersRes.data?.content || (Array.isArray(usersRes.data) ? usersRes.data : []);
      const propertyData = propertiesRes.data?.content || (Array.isArray(propertiesRes.data) ? propertiesRes.data : []);
      setUsers(userData);
      setProperties(propertyData);
    } catch (err) {
      console.error("Error fetching appointment form options:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchFormOptions();
  }, []);

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      if (filterStatus !== "ALL" && appointment.status !== filterStatus) return false;
      if (!debouncedSearch) return true;

      const query = debouncedSearch.toLowerCase();
      return [appointment.propertyName, appointment.user, appointment.date]
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [appointments, filterStatus, debouncedSearch]);

  const formatDate = (value) => {
    if (!value || value === "-") return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("sq-AL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (appointment) => {
    setForm({
      id: appointment.id,
      username: appointment.user,
      propertyId: appointment.propertyId || "",
      date: toDateTimeInput(appointment.date),
      status: appointment.status || "PENDING",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setForm(emptyForm);
  };

  const updateStatus = async (appointment, status) => {
    try {
      const res = await appointmentAPI.updateStatus(appointment.id, status);
      const nextStatus = res.data?.status || status;
      setAppointments((current) => current.map((item) => (
        item.id === appointment.id ? { ...item, status: nextStatus } : item
      )));
      toast.success("Statusi i takimit u përditësua.");
    } catch (err) {
      console.error("Error updating appointment status:", err);
      toast.error("Nuk mund të përditësohet statusi.");
    }
  };

  const submitForm = async (event) => {
    event.preventDefault();

    if (!form.username || !form.propertyId || !form.date) {
      toast.error("Plotësoni përdoruesin, pronën dhe datën.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        username: form.username,
        propertyId: Number(form.propertyId),
        date: form.date,
        status: form.status,
      };

      if (form.id) {
        await appointmentAPI.update(form.id, payload);
        toast.success("Takimi u përditësua.");
      } else {
        await appointmentAPI.createAdmin(payload);
        toast.success("Takimi u krijua.");
      }

      closeForm();
      fetchAppointments();
    } catch (err) {
      console.error("Error saving appointment:", err);
      toast.error("Takimi nuk mund të ruhet.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAppointment = async () => {
    if (!deleteTarget) return;

    try {
      await appointmentAPI.delete(deleteTarget.id);
      setAppointments((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Takimi u fshi.");
    } catch (err) {
      console.error("Error deleting appointment:", err);
      toast.error("Takimi nuk mund të fshihet.");
    }
  };

  const actionButtons = (appointment) => (
    <div className="flex flex-wrap gap-2">
      <button onClick={() => updateStatus(appointment, "APPROVED")} className="rounded-lg bg-green-500/10 p-1.5 text-green-400 transition-colors hover:bg-green-500/20" title="Aprovo">
        <Check size={14} />
      </button>
      <button onClick={() => updateStatus(appointment, "REJECTED")} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20" title="Refuzo">
        <X size={14} />
      </button>
      <button onClick={() => setDetailsAppointment(appointment)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white" title="Shiko">
        <Eye size={14} />
      </button>
      <button onClick={() => openEditForm(appointment)} className="rounded-lg bg-[#EFD391]/10 p-1.5 text-[#EFD391] transition-colors hover:bg-[#EFD391]/20" title="Edito">
        <Edit3 size={14} />
      </button>
      <button onClick={() => setDeleteTarget(appointment)} className="rounded-lg bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20" title="Fshij">
        <Trash2 size={14} />
      </button>
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-xl font-bold text-white">Menaxhimi i Takimeve</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EFD391] px-3 py-2 text-xs font-bold text-black transition-colors hover:bg-[#D9BF7B]"
          >
            <CalendarPlus size={15} /> Shto takim
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#123E35] px-3 py-2 sm:w-72">
            <Search size={14} className="shrink-0 text-white/40" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Kërko pronë ose përdorues..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder-white/30"
            />
            {search && <button onClick={() => setSearch("")}><X size={13} className="text-white/40" /></button>}
          </div>
          <button onClick={() => setView("table")} className={`rounded-lg border p-2 transition-colors ${view === "table" ? "border-[#EFD391]/30 bg-[#EFD391]/15 text-[#EFD391]" : "border-white/10 text-white/40 hover:text-white"}`}>
            <Table2 size={17} />
          </button>
          <button onClick={() => setView("cards")} className={`rounded-lg border p-2 transition-colors ${view === "cards" ? "border-[#EFD391]/30 bg-[#EFD391]/15 text-[#EFD391]" : "border-white/10 text-white/40 hover:text-white"}`}>
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <select
          value={filterStatus}
          onChange={(event) => setFilterStatus(event.target.value)}
          className="rounded-lg border border-white/10 bg-[#123E35] px-3 py-2 text-sm text-white/70 outline-none focus:border-[#EFD391]/40"
        >
          <option value="ALL">Të gjitha statuset</option>
          <option value="PENDING">Në pritje</option>
          <option value="APPROVED">Aprovuar</option>
          <option value="REJECTED">Refuzuar</option>
        </select>
        {(filterStatus !== "ALL" || search) && (
          <button
            onClick={() => {
              setFilterStatus("ALL");
              setSearch("");
            }}
            className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <X size={13} /> Pastro
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-lg bg-white/5" />)}</div>
      ) : error ? (
        <div className="py-8 text-center text-red-400">Gabim gjatë marrjes së takimeve.</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-white/40">Nuk u gjetën takime.</div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F4638]">
          <table className="w-full min-w-175 text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["ID", "Prona", "Përdoruesi", "Data", "Statusi", "Veprime"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((appointment) => (
                <tr key={appointment.id} className="border-b border-white/5 transition-colors hover:bg-white/3">
                  <td className="px-4 py-3 font-mono text-xs text-white/40">{appointment.id}</td>
                  <td className="px-4 py-3 text-white">{appointment.propertyName}</td>
                  <td className="px-4 py-3 text-white/60">{appointment.user}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{formatDate(appointment.date)}</td>
                  <td className="px-4 py-3"><StatusBadge status={appointment.status} /></td>
                  <td className="px-4 py-3">{actionButtons(appointment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((appointment) => (
            <div key={appointment.id} className="rounded-xl border border-white/10 bg-[#0F4638] p-4 transition-colors hover:border-white/20">
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-white">{appointment.propertyName}</p>
                <StatusBadge status={appointment.status} />
              </div>
              <p className="mb-1 text-xs text-white/50">{appointment.user}</p>
              <p className="mb-4 text-xs text-white/40">{formatDate(appointment.date)}</p>
              <div className="border-t border-white/5 pt-3">{actionButtons(appointment)}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-30">Pas</button>
        <span className="text-sm text-white/50">Faqja {page} / {totalPages}</span>
        <button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-30">Para</button>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#123E35] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{form.id ? "Edito takim" : "Shto takim"}</h3>
              <button onClick={closeForm} className="text-white/40 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={submitForm} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/40">Përdoruesi</span>
                <select
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]/60"
                  required
                >
                  <option value="">Zgjidh përdoruesin</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.username}>{user.username} - {user.email}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/40">Prona</span>
                <select
                  value={form.propertyId}
                  onChange={(event) => setForm((current) => ({ ...current, propertyId: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]/60"
                  required
                >
                  <option value="">Zgjidh pronën</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/40">Data</span>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]/60"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-white/40">Statusi</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none focus:border-[#EFD391]/60"
                >
                  <option value="PENDING">Në pritje</option>
                  <option value="APPROVED">Aprovuar</option>
                  <option value="REJECTED">Refuzuar</option>
                </select>
              </label>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={closeForm} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Anulo</button>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#EFD391] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#D9BF7B] disabled:opacity-60">
                  {saving ? "Duke ruajtur..." : "Ruaj"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#123E35] p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold text-white">Detajet e Takimit</h3>
            {[
              ["ID", detailsAppointment.id],
              ["Prona", detailsAppointment.propertyName],
              ["Përdoruesi", detailsAppointment.user],
              ["Data", formatDate(detailsAppointment.date)],
            ].map(([label, value]) => (
              <div key={label} className="mb-2 flex gap-2">
                <span className="w-24 shrink-0 text-sm text-white/40">{label}:</span>
                <span className="text-sm text-white">{value}</span>
              </div>
            ))}
            <div className="mb-4 flex gap-2">
              <span className="w-24 shrink-0 text-sm text-white/40">Statusi:</span>
              <StatusBadge status={detailsAppointment.status} />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setDetailsAppointment(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Mbyll</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#123E35] p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-semibold text-white">Fshirje takimi</h3>
            <p className="mb-6 text-sm text-white/60">A dëshironi të fshini takimin për <b className="text-white">{deleteTarget.propertyName}</b>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Anulo</button>
              <button onClick={deleteAppointment} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">Fshij</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

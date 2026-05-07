import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Building2, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft, Plus, X } from "lucide-react";
import { appointmentAPI, propertyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const STATUS = {
  PENDING:  { label: "Në pritje",  cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  APPROVED: { label: "Aprovuar",  cls: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle },
  REJECTED: { label: "Refuzuar",  cls: "bg-red-100 text-red-600 border-red-200",       icon: XCircle },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200", icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.cls}`}>
      <Icon size={13} /> {cfg.label}
    </span>
  );
};

export default function Appointment() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPropertyId = searchParams.get("propertyId");

  const [appointments, setAppointments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    propertyId: preselectedPropertyId || "",
    date: "",
    time: "10:00",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      const redirect = preselectedPropertyId ? `/appointment?propertyId=${preselectedPropertyId}` : "/appointment";
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`, { replace: true });
      return;
    }
    fetchData();
    if (preselectedPropertyId) setShowForm(true);
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [apptRes, propRes] = await Promise.all([
        appointmentAPI.getMy(),
        propertyAPI.getProperties({ page: 0, size: 100 }),
      ]);
      const apptData = apptRes.data;
      setAppointments(Array.isArray(apptData) ? apptData : apptData?.content ?? []);
      const propData = propRes.data;
      const list = Array.isArray(propData) ? propData : propData.content ?? [];
      setProperties(list);
    } catch (e) {
      console.error(e);
      toast.error("Gabim gjatë ngarkimit të të dhënave.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.propertyId) return toast.error("Zgjidh pronën.");
    if (!form.date) return toast.error("Zgjidh datën.");

    const dateTime = `${form.date}T${form.time}:00`;
    setSubmitting(true);
    try {
      await appointmentAPI.create(Number(form.propertyId), dateTime);
      toast.success("Takimi u rezervua me sukses! Do të merrni konfirmim brenda pak.");
      setShowForm(false);
      setForm({ propertyId: preselectedPropertyId || "", date: "", time: "10:00" });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Gabim gjatë rezervimit.";
      toast.error(typeof msg === "string" ? msg : "Gabim gjatë rezervimit.");
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#FFAE42] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-black text-white">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-[#FFAE42] text-xs font-semibold tracking-widest uppercase mb-4">Rezervimet</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Takimet e Mia</h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">Rezervo takim për të vizituar pronën tënde të preferuar.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Book button */}
        {!showForm && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} /> Rezervo Takim
            </button>
          </div>
        )}

        {/* Booking form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Rezervo Takim të Ri</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prona *</label>
                <select
                  value={form.propertyId}
                  onChange={(e) => setForm((f) => ({ ...f, propertyId: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition bg-white"
                >
                  <option value="">— Zgjidh pronën —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.city?.split(",")[0] || p.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date + time row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Data *</label>
                  <input
                    type="date"
                    min={minDate}
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Ora *</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FFAE42]/40 focus:border-[#FFAE42] outline-none transition bg-white"
                  >
                    {["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-60 text-black font-semibold rounded-xl text-sm transition-colors"
                >
                  {submitting ? "Duke dërguar..." : "Dërgo Kërkesën"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm transition-colors"
                >
                  Anulo
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Appointments list */}
        {loadingData ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-[#FFAE42] border-t-transparent rounded-full animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CalendarDays size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nuk keni takime akoma</h3>
            <p className="text-gray-400 text-sm mb-6">Rezervoni takimin tuaj të parë duke klikuar butonin mësipërm.</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              <Plus size={16} /> Rezervo Tani
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Rezervimet tuaja ({appointments.length})</h2>
            {appointments.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FFAE42]/10 flex items-center justify-center shrink-0">
                    <Building2 size={20} className="text-[#FFAE42]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {a.propertyTitle || `Pronë #${a.propertyId}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {a.date ? new Date(a.date).toLocaleString("sq-AL", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                    </p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
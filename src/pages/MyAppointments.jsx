import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Building2, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { appointmentAPI } from "../services/api";
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

export default function MyAppointments() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login?redirect=/my-appointments", { replace: true });
      return;
    }
    fetchAppointments();
  }, [isAuthenticated, authLoading]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getMy();
      setAppointments(res.data || []);
    } catch {
      toast.error("Gabim gjatë ngarkimit të takimeve.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#FFAE42] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <span className="inline-block text-[#FFAE42] text-xs font-semibold tracking-widest uppercase mb-4">Rezervimet</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Takimet e Mia</h1>
          <p className="text-gray-400 text-base">Shikoni statusin e rezervimeve tuaja.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FFAE42] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CalendarDays size={40} className="text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nuk keni takime akoma</h3>
            <p className="text-gray-400 text-sm mb-6">Rezervoni takimin tuaj të parë duke vizituar pronën.</p>
            <button
              onClick={() => navigate("/appointment")}
              className="inline-flex items-center gap-2 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <CalendarDays size={16} /> Rezervo Tani
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">Rezervimet tuaja ({appointments.length})</h2>
            {appointments.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
              >
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Home,
  LayoutGrid,
  PlusSquare,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminAPI, appointmentAPI, propertyAPI } from "../../services/api";
import { paths } from "../../routes/paths";
import StatsCard from "../components/StatsCard";

const typeLabels = {
  BANESA: "Banesa",
  SHTEPI: "Shtëpi",
  LOKALE: "Lokale",
  TOKA: "Toka",
};

const statusLabels = {
  FOR_SALE: "Në shitje",
  FOR_RENT: "Me qira",
  PENDING: "Në pritje",
  APPROVED: "Aprovuar",
  REJECTED: "Refuzuar",
};

const colors = ["#EFD391", "#5EEAD4", "#93C5FD", "#FCA5A5", "#C4B5FD", "#86EFAC"];

const emptyStats = {
  totalProperties: 0,
  activeListings: 0,
  appointments: 0,
  users: 0,
};

const listFromPage = (data) => (Array.isArray(data) ? data : data?.content ?? []);

const countBy = (items, getKey) =>
  Object.entries(
    items.reduce((acc, item) => {
      const key = getKey(item) || "Pa të dhëna";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

const getCity = (property) => property.location?.split(",")[0]?.trim() || "Pa qytet";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const name = label || item.name || item.payload?.name;

  return (
    <div className="rounded-lg border border-white/10 bg-[#082E27]/95 px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold text-white">{name}</p>
      <p className="mt-1 text-xs text-white/60">
        Totali: <span className="font-semibold text-[#EFD391]">{item.value}</span>
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [properties, setProperties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, propertiesRes, appointmentsRes] = await Promise.all([
          adminAPI.getStats(),
          propertyAPI.getProperties({ page: 0, size: 500, sort: "id,desc" }),
          appointmentAPI.getAll({ page: 0, size: 500 }),
        ]);

        if (cancelled) return;

        setStats({ ...emptyStats, ...statsRes.data });
        setProperties(listFromPage(propertiesRes.data));
        setAppointments(listFromPage(appointmentsRes.data));
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Nuk u ngarkuan statistikat e dashboard-it.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const overviewData = useMemo(
    () => [
      { name: "Prona", value: stats.totalProperties, color: "#EFD391" },
      { name: "Prona aktive", value: stats.activeListings, color: "#34D399" },
      { name: "Përdorues", value: stats.users, color: "#60A5FA" },
      { name: "Takime", value: stats.appointments, color: "#F87171" },
    ],
    [stats]
  );

  const propertyStatusData = useMemo(
    () => countBy(properties, (property) => statusLabels[property.status] || property.status),
    [properties]
  );

  const propertyTypeData = useMemo(
    () => countBy(properties, (property) => typeLabels[property.type] || property.type),
    [properties]
  );

  const cityData = useMemo(
    () => countBy(properties, getCity).sort((a, b) => b.value - a.value).slice(0, 6),
    [properties]
  );

  const appointmentStatusData = useMemo(
    () => countBy(appointments, (appointment) => statusLabels[appointment.status] || appointment.status),
    [appointments]
  );

  const activeRate = stats.totalProperties
    ? Math.round((stats.activeListings / stats.totalProperties) * 100)
    : 0;

  const pendingAppointments = appointments.filter((item) => item.status === "PENDING").length;

  const cards = [
    {
      title: "Prona totale",
      value: stats.totalProperties,
      subtitle: `${activeRate}% aktive`,
      icon: Building2,
      tone: "gold",
    },
    {
      title: "Prona aktive",
      value: stats.activeListings,
      subtitle: "Në shitje ose qira",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      title: "Takime",
      value: stats.appointments,
      subtitle: `${pendingAppointments} në pritje`,
      icon: CalendarCheck,
      tone: "red",
    },
    {
      title: "Përdorues",
      value: stats.users,
      subtitle: "Llogari në sistem",
      icon: Users,
      tone: "blue",
    },
  ];

  if (error) {
    return <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#EFD391]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Pamje e përgjithshme</h1>
          <p className="mt-1 text-sm text-white/45">Monitoro pronat, takimet dhe aktivitetin kryesor të platformës.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={paths.adminPropertyAdd} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#EFD391] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#D9BF7B]">
            <PlusSquare size={16} /> Shto pronë
          </Link>
          <Link to={paths.adminProperties} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/5 hover:text-white">
            <LayoutGrid size={16} /> Menaxho pronat
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, index) => <div key={index} className="h-32 animate-pulse rounded-xl bg-white/5" />)
          : cards.map((card) => <StatsCard key={card.title} {...card} />)}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <section className="rounded-xl border border-white/10 bg-[#0F4638] p-5 xl:col-span-2">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-white">Analiza kryesore</h2>
                <p className="text-xs text-white/40">Krahasim i volumit total në sistem</p>
              </div>
              <BarChart3 size={20} className="text-[#EFD391]" />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={overviewData} barSize={46} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#1D5A4B" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#A7B7B0", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A7B7B0", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: "rgba(239,211,145,0.06)" }} content={<ChartTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <LabelList dataKey="value" position="top" fill="#E8E1D2" fontSize={12} fontWeight={700} />
                  {overviewData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="rounded-xl border border-white/10 bg-[#0F4638] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Llojet e pronave</h2>
                <p className="text-xs text-white/40">Shpërndarja sipas kategorisë</p>
              </div>
              <Home size={20} className="text-[#EFD391]" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={propertyTypeData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={3}>
                  {propertyTypeData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <MetricList data={propertyTypeData} />
          </section>

          <MetricPanel title="Statusi i pronave" icon={Activity} data={propertyStatusData} />
          <MetricPanel title="Top qytetet" icon={Building2} data={cityData} />
          <MetricPanel title="Statusi i takimeve" icon={Clock} data={appointmentStatusData} />
        </div>
      )}
    </div>
  );
}

function MetricPanel({ title, icon: Icon, data }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0F4638] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-white">{title}</h2>
        <Icon size={19} className="text-[#EFD391]" />
      </div>
      <MetricList data={data} />
    </section>
  );
}

function MetricList({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length) {
    return <p className="rounded-lg bg-white/5 px-3 py-4 text-center text-sm text-white/35">Nuk ka të dhëna.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const percent = total ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.name}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-white/70">{item.name}</span>
              <span className="font-semibold text-white">{item.value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/7">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: colors[index % colors.length] }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

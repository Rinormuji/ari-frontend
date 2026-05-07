import { useEffect, useState } from "react";
import StatsCard from "../components/StatsCard";
import { adminAPI } from "../../services/api";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     setError("No token found. Please log in.");
  //     setLoading(false);
  //     return;
  //   }

  //   axios
  //     .get(`${API_BASE}/api/users/stats`, {
  //       headers: { Authorization: `Bearer ${token}` }
  //     })
  //     .then(res => {
  //       setStats(res.data);
  //       setLoading(false);
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       setError("Failed to load stats.");
  //       setLoading(false);
  //     });
  // }, []);

   useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminAPI.getStats(); // përdor api.js instance
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error)
    return <div className="text-red-500 mt-20 text-center">{error}</div>;

  const cards = [
    {
      title: "Total Properties",
      value: stats?.totalProperties,
      gradient: "linear-gradient(135deg, #1f2933, #374151)" // ngjyra e errët, harmonizuar
    },
    {
      title: "Appointments",
      value: stats?.appointments,
      gradient: "linear-gradient(135deg, #1f2933, #374151)"
    },
    {
      title: "Users",
      value: stats?.users,
      gradient: "linear-gradient(135deg, #1f2933, #374151)"
    },
    {
      title: "Active Listings",
      value: stats?.activeListings,
      gradient: "linear-gradient(135deg, #1f2933, #374151)"
    }
  ];
  

  const chartData = [
    { name: "Prona", value: stats?.totalProperties ?? 0, color: "#FFAE42" },
    { name: "Aktive", value: stats?.activeListings ?? 0, color: "#10B981" },
    { name: "Përdorues", value: stats?.users ?? 0, color: "#3B82F6" },
    { name: "Takime", value: stats?.appointments ?? 0, color: "#F87171" },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)
          : cards.map((card, i) => <StatsCard key={i} {...card} />)}
      </div>

      {/* Chart */}
      {!loading && stats && (
        <div className="bg-[#111111] border border-white/10 p-5 rounded-xl">
          <h3 className="text-white font-semibold mb-4">Analiza e Performancës</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barSize={48} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#2a2a2a" vertical={false} />
              <XAxis dataKey="name" stroke="#666" tick={{ fill: "#aaa", fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#666" tick={{ fill: "#aaa", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }}
                formatter={(value, name) => [value, name]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

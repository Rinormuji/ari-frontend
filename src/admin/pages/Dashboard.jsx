import { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../components/StatsCard";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    axios.get("http://localhost:8080/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStats(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setError("Failed to load stats.");
      setLoading(false);
    });
  }, []);

  if (error) return <div className="text-red-500 mt-20 text-center">{error}</div>;

  const cards = [
    { title: "Total Properties", value: stats?.totalProperties, gradient: "linear-gradient(135deg, #FFAE42, #FF7F50)" },
    { title: "Appointments", value: stats?.appointments, gradient: "linear-gradient(135deg, #552200, #FFAE42)" },
    { title: "Users", value: stats?.users, gradient: "linear-gradient(135deg, #1E3A8A, #3B82F6)" },
    { title: "Active Listings", value: stats?.activeListings, gradient: "linear-gradient(135deg, #10B981, #3B82F6)" }
  ];

  const chartData = [
    { name: "Statistics", properties: stats?.totalProperties, active: stats?.activeListings, users: stats?.users, appointments: stats?.appointments }
  ];

  return (
    <>
      <div className="dashboard-grid">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="stats-skeleton"></div>)
          : cards.map((card, i) => <StatsCard key={i} {...card} />)
        }
      </div>

      {!loading && stats && (
        <div className="chart-container">
          <h3 className="chart-title">Analiza e Performancës</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <Line type="monotone" dataKey="properties" stroke="#FFAE42" strokeWidth={3} />
              <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={3} />
              <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} />
              <Line type="monotone" dataKey="appointments" stroke="#FF4444" strokeWidth={3} />
              <CartesianGrid strokeDasharray="5 5" stroke="#444" />
              <XAxis dataKey="name" stroke="#ddd" />
              <YAxis stroke="#ddd" />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}

export default Dashboard;

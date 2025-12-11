import { useState } from "react";
import '../admin.css'

function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState([
    { id: 1, propertyId: 101, propertyName: "Banesa në Tiranë", user: "Arti Krasniqi", date: "2025-02-10", status: "PENDING" },
    { id: 2, propertyId: 102, propertyName: "Shtepi në Prishtinë", user: "Elira Gashi", date: "2025-02-11", status: "APPROVED" },
    { id: 3, propertyId: 103, propertyName: "Lokale në Pejë", user: "Besart Berisha", date: "2025-02-12", status: "REJECTED" },
  ]);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  // Filter + Search
  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === "ALL" ? true : a.status === filterStatus;
    const matchSearch = a.user.toLowerCase().includes(search.toLowerCase().trim());
    return matchStatus && matchSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApprove = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a));
    setConfirmAction(null);
  };

  const handleReject = (id) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: "REJECTED" } : a));
    setConfirmAction(null);
  };

  return (
    <div className="appointments-admin-container">
      <h2 className="text-2xl font-bold text-white mb-4">Menaxhimi i Termineve</h2>

      {/* FILTER + SEARCH */}
      <div className="appointments-actions">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">Të gjitha statuset</option>
          <option value="PENDING">Në pritje</option>
          <option value="APPROVED">Aprovuar</option>
          <option value="REJECTED">Refuzuar</option>
        </select>

        <input
          type="text"
          placeholder="Kërko përdoruesin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* TABELA */}
      <div className="appointments-table-container">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prona</th>
              <th>Përdoruesi</th>
              <th>Data</th>
              <th>Statusi</th>
              <th>Veprimet</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.propertyName} (#{a.propertyId})</td>
                <td>{a.user}</td>
                <td>{a.date}</td>
                <td>
                  <span className={`app-status-badge ${
                    a.status === "PENDING" ? "app-status-pending" :
                    a.status === "APPROVED" ? "app-status-approved" : "app-status-rejected"
                  }`}>
                    {a.status}
                  </span>
                </td>
                <td>
                  <button className="app-action-button app-action-view" onClick={() => setSelectedAppointment(a)}>Detaje</button>
                  {a.status === "PENDING" && (
                    <>
                      <button className="app-action-button app-action-approve" onClick={() => setConfirmAction({ type: "approve", id: a.id })}>Aprovo</button>
                      <button className="app-action-button app-action-reject" onClick={() => setConfirmAction({ type: "reject", id: a.id })}>Refuzo</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Nuk u gjet asnjë takim.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="app-pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* MODAL VIEW DETAILS */}
      {selectedAppointment && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <h3 className="text-xl font-bold mb-3">Detajet e Terminit</h3>
            <p><b>ID:</b> {selectedAppointment.id}</p>
            <p><b>Prona:</b> {selectedAppointment.propertyName} (#{selectedAppointment.propertyId})</p>
            <p><b>Përdoruesi:</b> {selectedAppointment.user}</p>
            <p><b>Data:</b> {selectedAppointment.date}</p>
            <p><b>Statusi:</b> <span className={`app-status-badge ${
              selectedAppointment.status === "PENDING" ? "app-status-pending" :
              selectedAppointment.status === "APPROVED" ? "app-status-approved" : "app-status-rejected"
            }`}>{selectedAppointment.status}</span></p>
            <div className="app-modal-actions">
              <button className="app-action-button app-action-reject" onClick={() => setSelectedAppointment(null)}>Mbyll</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      {confirmAction && (
        <div className="app-modal-overlay">
          <div className="app-modal">
            <h3 className="text-xl font-bold mb-3">Konfirmim</h3>
            <p>A je i sigurt që dëshiron të {confirmAction.type === "approve" ? "aprovosh" : "refuzosh"} këtë takim?</p>
            <div className="app-modal-actions">
              <button className="app-action-button app-action-approve" onClick={() =>
                confirmAction.type === "approve" ? handleApprove(confirmAction.id) : handleReject(confirmAction.id)
              }>Po</button>
              <button className="app-action-button app-action-reject" onClick={() => setConfirmAction(null)}>Jo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentsAdmin;

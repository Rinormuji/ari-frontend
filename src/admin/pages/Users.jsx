import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash, FaBan } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const PAGE_SIZE = 10;

export default function UsersAdmin({ currentUserRoles = [] }) {
  // 1. Sigurohemi që users është gjithmonë array bosh në fillim
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Kontrolli për admin (Shtuar mbrojtje për shkronja të vogla/mëdha)
  const isAdmin = currentUserRoles?.some(role => 
    role.toUpperCase() === "ADMIN" || role.toUpperCase() === "ROLE_ADMIN"
  );

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token"); // Merre token-in këtu
      const res = await axios.get(`${API_BASE}/api/users`, {
        params: { page: page - 1, size: PAGE_SIZE, search },
        headers: {
          // KJO ËSHTË PJESA KRITIKE
          'Authorization': `Bearer ${token}` 
        },
        withCredentials: true,
      });
  
      // Kontrollo strukturën (Spring Page vs List)
      if (res.data.content) {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
      } else {
        setUsers(res.data || []);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Error fetching users", err);
      // Nëse merr 403 këtu, do të thotë që Backend-i nuk po e pranon Token-in
    } finally {
      setLoading(false);
    }
  };
  /* ================= ACTIONS ================= */
  const updateEmail = async () => {
    if (!isAdmin || !selectedUser) return;
    try {
      await axios.put(
        `${API_BASE}/api/users/${selectedUser.id}/email`,
        null,
        { params: { email: selectedUser.email }, withCredentials: true }
      );
      closeModal();
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const updateRoles = async () => {
    if (!isAdmin || !selectedUser) return;
    try {
      await axios.put(
        `${API_BASE}/api/users/${selectedUser.id}/roles`,
        selectedUser.roles,
        { withCredentials: true }
      );
      closeModal();
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (userId) => {
    try {
      const token = localStorage.getItem("token"); // 1. Merre tokenin
      
      // 2. Dërgoje në header
      await axios.put(`${API_BASE}/api/users/${userId}/toggle-status`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
  
      // Përditëso listën lokalisht
      setUsers(users.map(u => u.id === userId ? { ...u, enabled: !u.enabled } : u));
    } catch (err) {
      console.error("Gabim gjatë bllokimit:", err);
      alert("Nuk mund të ndryshohet statusi i përdoruesit.");
    }
  };

  const deleteUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`${API_BASE}/api/users/${selectedUser.id}`, {
        withCredentials: true,
      });
      closeModal();
      fetchUsers();
    } catch (err) { console.error(err); }
  };

  /* ================= MODAL ================= */
  const openModal = (type, user) => {
    setSelectedUser({ ...user });
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  /* ================= UI ================= */
  return (
    <div className="admin-page-container p-4">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Menaxhimi i Përdoruesve</h2>
        <input
          className="filter-input"
          placeholder="Kërko username ose email"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ width: 280 }}
        />
      </div>

      {/* TABLE */}
      <div className="properties-table-container">
        {loading ? (
          <div className="flex justify-center items-center" style={{ height: 200 }}>
             <p className="text-white">Duke u ngarkuar...</p>
          </div>
        ) : (
          <table className="properties-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {/* Përdorim optional chaining dhe fallback [] */}
              {(users || []).map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar">{u.username?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="text-white font-medium">{u.username}</div>
                        <div className="text-sm text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>{u.roles?.join(", ") || "No Roles"}</td>

                  <td>
                    <span className={`status-badge ${u.status === "ACTIVE" ? "status-approved" : "status-rejected"}`}>
                      {u.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="action-button action-view" onClick={() => openModal("view", u)}>
                        <FaEye />
                      </button>
                      <button className="action-button action-edit" onClick={() => openModal("edit", u)}>
                        <FaEdit />
                      </button>
                      <button className="action-button action-reject" onClick={() => openModal("status", u)}>
                        <FaBan />
                      </button>
                      <button className="action-button action-delete" onClick={() => openModal("delete", u)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Kontrolli për listë bosh */}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-400">Nuk ka përdorues.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-center gap-3 mt-6" style={{ marginTop: "20px" }}>
        <button className="filter-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <div style={{ color: "#cbd5e1" }}>Faqja {page} / {totalPages}</div>
        <button className="filter-button" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>

      {/* MODALS */}
      {modalType && selectedUser && (
        <div className="users-admin-modal-overlay">
          <div className="users-admin-modal">
            {modalType === "view" && (
              <>
                <h3>Detajet e Përdoruesit</h3>
                <p><b>Username:</b> {selectedUser.username}</p>
                <p><b>Email:</b> {selectedUser.email}</p>
                <p><b>Status:</b> {selectedUser.status}</p>
                <p><b>Roles:</b> {selectedUser.roles?.join(", ") || "N/A"}</p>
                
                <p className="mt-4 font-bold">Appointments:</p>
                <ul>
                  {selectedUser.appointments?.length ? selectedUser.appointments.map(a => (
                    <li key={a.id} className="users-admin-appointment-card">
                      {a.propertyId} - {a.date} ({a.status})
                    </li>
                  )) : <li className="text-sm text-gray-500">Nuk ka appointments.</li>}
                </ul>
              </>
            )}

            {modalType === "edit" && (
              <>
                <h3>Edit User</h3>
                <label className="text-sm text-gray-400">Email:</label>
                <input
                  className="users-admin-modal-input"
                  value={selectedUser.email || ""}
                  onChange={(e) => isAdmin && setSelectedUser({...selectedUser, email: e.target.value})}
                  disabled={!isAdmin}
                />
                <label className="text-sm text-gray-400 mt-2">Roles (mbaj shtypur CTRL për t'i zgjedhur disa):</label>
                <select
                  className="users-admin-modal-input"
                  multiple
                  value={selectedUser.roles || []}
                  onChange={(e) => {
                    if (!isAdmin) return;
                    setSelectedUser({
                      ...selectedUser,
                      roles: Array.from(e.target.selectedOptions).map(o => o.value)
                    });
                  }}
                  disabled={!isAdmin}
                >
                  <option value="ROLE_USER">USER</option>
                  <option value="ROLE_ADMIN">ADMIN</option>
                </select>

                {isAdmin ? (
                  <div className="flex gap-2 mt-4">
                    <button className="users-admin-modal-btn success" onClick={updateEmail}>Ruaj Email</button>
                    <button className="users-admin-modal-btn primary" onClick={updateRoles}>Ruaj Role</button>
                  </div>
                ) : (
                  <p className="text-red-500 text-sm mt-2">Nuk keni leje për modifikim.</p>
                )}
              </>
            )}

            {modalType === "status" && (
              <>
                <h3>Konfirmim</h3>
                <p>A je i sigurt që dëshiron të <b>{selectedUser.status === "ACTIVE" ? "bllokosh" : "aktivizosh"}</b> këtë përdorues?</p>
                <button className="users-admin-modal-btn warning" onClick={toggleStatus}>Po, vazhdo</button>
              </>
            )}

            {modalType === "delete" && (
              <>
                <h3>Fshirje</h3>
                <p>Ky veprim është i pakthyeshëm. A dëshiron të fshish <b>{selectedUser.username}</b>?</p>
                <button className="users-admin-modal-btn danger" onClick={deleteUser}>Fshij</button>
              </>
            )}

            <button className="users-admin-modal-btn cancel" onClick={closeModal}>Mbyll</button>
          </div>
        </div>
      )}
    </div>
  );
}
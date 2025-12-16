import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye, FaEdit, FaTrash, FaBan } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const PAGE_SIZE = 10;

export default function UsersAdmin({ currentUserRoles = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const isAdmin = currentUserRoles.includes("ADMIN");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/users`, {
        params: { page: page - 1, size: PAGE_SIZE, search },
        withCredentials: true,
      });

      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTIONS ================= */
  const updateEmail = async () => {
    if (!isAdmin) return;
    await axios.put(
      `${API_BASE}/api/users/${selectedUser.id}/email`,
      null,
      { params: { email: selectedUser.email }, withCredentials: true }
    );
    closeModal();
    fetchUsers();
  };

  const updateRoles = async () => {
    if (!isAdmin) return;
    await axios.put(
      `${API_BASE}/api/users/${selectedUser.id}/roles`,
      selectedUser.roles,
      { withCredentials: true }
    );
    closeModal();
    fetchUsers();
  };

  const toggleStatus = async () => {
    const newStatus =
      selectedUser.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

    await axios.put(
      `${API_BASE}/api/users/${selectedUser.id}/status`,
      null,
      { params: { status: newStatus }, withCredentials: true }
    );
    closeModal();
    fetchUsers();
  };

  const deleteUser = async () => {
    await axios.delete(`${API_BASE}/api/users/${selectedUser.id}`, {
      withCredentials: true,
    });
    closeModal();
    fetchUsers();
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
          <div style={{ height: 200 }} />
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="user-avatar">{u.username.charAt(0)}</div>
                      <div>
                        <div className="text-white font-medium">{u.username}</div>
                        <div className="text-sm text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>{u.roles?.join(", ")}</td>

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

              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">Nuk ka përdorues.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="users-admin-pagination">
  <button className="filter-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
  <div style={{ color: "#cbd5e1" }}>Faqja {page} / {totalPages}</div>
  <button className="filter-button" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
</div>

       {/* PAGINATION */}
       <div className="flex items-center justify-center gap-3 mt-6">
        ...
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
                <p><b>First Name:</b> {selectedUser.firstName}</p>
                <p><b>Last Name:</b> {selectedUser.lastName}</p>
                <p><b>Phone:</b> {selectedUser.phoneNumber}</p>
                <p><b>Status:</b> {selectedUser.status}</p>
                <p><b>Roles:</b> {selectedUser.roles?.join(", ")}</p>
                <p><b>Join Date:</b> {selectedUser.joinDate || "N/A"}</p>
                <p><b>Appointments:</b></p>
                <ul>
                  {selectedUser.appointments?.length ? selectedUser.appointments.map(a => (
                    <li key={a.id} className="users-admin-appointment-card">
                      {a.propertyId} - {a.date} ({a.status})
                    </li>
                  )) : <li>Nuk ka appointments.</li>}
                </ul>
              </>
            )}

            {modalType === "edit" && (
              <>
                <h3>Edit User (Vetëm admin mund të ndryshojë email/roles)</h3>
                <input
                  className="users-admin-modal-input"
                  value={selectedUser.email}
                  onChange={(e) => isAdmin && setSelectedUser({...selectedUser, email: e.target.value})}
                  disabled={!isAdmin}
                />
                <select
                  className="users-admin-modal-input"
                  multiple
                  value={selectedUser.roles}
                  onChange={(e) => {
                    if (!isAdmin) return;
                    setSelectedUser({
                      ...selectedUser,
                      roles: Array.from(e.target.selectedOptions).map(o => o.value)
                    });
                  }}
                  disabled={!isAdmin}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>

                {isAdmin && (
                  <>
                    <button className="users-admin-modal-btn success" onClick={updateEmail}>Ruaj Email</button>
                    <button className="users-admin-modal-btn primary" onClick={updateRoles}>Ruaj Role</button>
                  </>
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
                <p>Kjo veprim është i pakthyeshëm.</p>
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

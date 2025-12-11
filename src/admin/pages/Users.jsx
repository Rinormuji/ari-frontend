import { useState } from "react";
import PropertiesTable from "../components/PropertiesTable";
import "../admin.css";
import Modal from "../components/Modal";
import { FaEdit, FaTrash, FaEye, FaBan } from "react-icons/fa";

function Users() {
  const [users, setUsers] = useState([]); // demo ose fetched data
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  // =======================
  // API ACTIONS (demo stub)
  // =======================
  const updateEmail = (email) => {
    console.log("update email:", email);
    closeModal();
  };
  const updateRoles = (roles) => {
    console.log("update roles:", roles);
    closeModal();
  };
  const updateStatus = () => {
    console.log("update status");
    closeModal();
  };
  const deleteUser = () => {
    console.log("delete user");
    closeModal();
  };

  return (
    <div className="users-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage registered users</p>
        </div>

        <div className="flex gap-4 text-white">
          <div className="text-center">
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {users?.filter(u => u.status === "ACTIVE").length || 0}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {users?.filter(u => u.status === "BLOCKED").length || 0}
            </div>
            <div className="text-sm text-gray-400">Blocked</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="p-2 rounded w-64 text-black"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="user-avatar">{user.username.charAt(0)}</div>
                    <div>
                      <div className="font-medium text-white">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>{[...user.roles].join(", ")}</td>
                <td>
                  <span
                    className={`status-badge ${
                      user.status === "ACTIVE" ? "status-active" : "status-blocked"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="actions">
                  <button onClick={() => openModal(user, "view")} className="action-button action-view"><FaEye size={14} /></button>
                  <button onClick={() => openModal(user, "edit")} className="action-button action-edit"><FaEdit size={14} /></button>
                  <button
                    className={`action-button ${
                      user.status === "ACTIVE" ? "action-block" : "action-unblock"
                    }`}
                    onClick={() => openModal(user, "block")}
                  >
                    <FaBan size={14} />
                  </button>
                  <button onClick={() => openModal(user, "delete")} className="action-button action-delete"><FaTrash size={14} /></button>
                </td>
              </tr>
            )) || null}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button disabled={page === 0} onClick={() => setPage(prev => prev - 1)} className="px-3 py-1 bg-gray-700 rounded text-white">Prev</button>
        <span className="text-white px-2 py-1">Page {page + 1} / {totalPages}</span>
        <button disabled={page + 1 >= totalPages} onClick={() => setPage(prev => prev + 1)} className="px-3 py-1 bg-gray-700 rounded text-white">Next</button>
      </div>

      {/* ---------------- MODALS ---------------- */}
      <Modal isOpen={modalType === "view"} onClose={closeModal} title="User Information" width="450px">
        {selectedUser && (
          <div>
            <p><b>Username:</b> {selectedUser.username}</p>
            <p><b>Email:</b> {selectedUser.email}</p>
            <p><b>Roles:</b> {[...selectedUser.roles].join(", ")}</p>
            <p><b>Status:</b> {selectedUser.status}</p>
          </div>
        )}
      </Modal>

      <Modal isOpen={modalType === "edit"} onClose={closeModal} title="Edit User" width="450px">
        {selectedUser && (
          <div className="flex flex-col gap-3">
            <label className="text-white text-sm">Email:</label>
            <input className="p-2 rounded bg-[#2e2e2e] text-white" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />

            <label className="text-white text-sm">Roles:</label>
            <select className="p-2 rounded bg-[#2e2e2e] text-white" multiple value={[...selectedUser.roles]} onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setSelectedUser({ ...selectedUser, roles: new Set(options) });
            }}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>

            <button onClick={() => updateEmail(selectedUser.email)} className="bg-blue-500 mt-3 py-2 rounded">Save Email</button>
            <button onClick={() => updateRoles([...selectedUser.roles])} className="bg-green-500 mt-3 py-2 rounded">Save Roles</button>
          </div>
        )}
      </Modal>

      <Modal isOpen={modalType === "block"} onClose={closeModal} title="Confirm Action" width="420px">
        {selectedUser && (
          <>
            <p>Are you sure you want to <b>{selectedUser.status === "ACTIVE" ? "block" : "unblock"}</b> user <b>{selectedUser.username}</b>?</p>
            <button onClick={updateStatus} className="mt-4 bg-yellow-500 w-full py-2 rounded">Yes, Confirm</button>
          </>
        )}
      </Modal>

      <Modal isOpen={modalType === "delete"} onClose={closeModal} title="Delete User" width="420px">
        {selectedUser && (
          <>
            <p>Are you sure you want to delete user <b>{selectedUser.username}</b>? This action cannot be undone.</p>
            <button onClick={deleteUser} className="mt-4 bg-red-600 w-full py-2 rounded">Yes, Delete</button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default Users;

import React, { useEffect, useState } from "react";
import { Eye, Pencil, Ban, Trash2, Search, UserPlus, ShieldCheck } from "lucide-react";
import { usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 10;

export default function UsersAdmin() {
  const { isSuperAdmin, isAdmin: isAdminFn } = useAuth();
  const superAdmin = isSuperAdmin();
  const isAdmin = isAdminFn();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Register form (SuperAdmin only — can add ADMIN or USER)
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({ username: "", email: "", password: "", role: "USER" });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
  setLoading(true);
  try {
    const res = await usersAPI.getUsers({ page: page-1, size: PAGE_SIZE, search });
    const data = res.data;
    const content = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
    setUsers(content);
    setTotalPages(data?.totalPages || 1);
  } catch (err) {
    console.error("Error fetching users", err);
    setUsers([]);
  } finally {
    setLoading(false);
  }
};

  // const fetchUsers = async () => {
  //   setLoading(true);
  //   try {
  //     const token = localStorage.getItem("token"); // Merre token-in këtu
  //     const res = await axios.get(`${API_BASE}/api/users`, {
  //       params: { page: page - 1, size: PAGE_SIZE, search },
  //       headers: {
  //         // KJO ËSHTË PJESA KRITIKE
  //         'Authorization': `Bearer ${token}` 
  //       },
  //       withCredentials: true,
  //     });
  
  //     // Kontrollo strukturën (Spring Page vs List)
  //     if (res.data.content) {
  //       setUsers(res.data.content);
  //       setTotalPages(res.data.totalPages);
  //     } else {
  //       setUsers(res.data || []);
  //       setTotalPages(1);
  //     }
  //   } catch (err) {
  //     console.error("Error fetching users", err);
  //     // Nëse merr 403 këtu, do të thotë që Backend-i nuk po e pranon Token-in
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  /* ================= ACTIONS ================= */
  const handleUpdateEmail = async () => {
  if (!selectedUser) return;
  await usersAPI.updateEmail(selectedUser.id, selectedUser.email);
};
  // const updateEmail = async () => {
  //   if (!isAdmin || !selectedUser) return;
  //   try {
  //     await axios.put(
  //       `${API_BASE}/api/users/${selectedUser.id}/email`,
  //       null,
  //       { params: { email: selectedUser.email }, withCredentials: true }
  //     );
  //     closeModal();
  //     fetchUsers();
  //   } catch (err) { console.error(err); }
  // };

const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      if (regForm.role === "ADMIN") {
        await usersAPI.registerAdmin({ username: regForm.username, email: regForm.email, password: regForm.password });
      } else {
        await usersAPI.registerUser({ username: regForm.username, email: regForm.email, password: regForm.password });
      }
      setShowRegForm(false);
      setRegForm({ username: "", email: "", password: "", role: "USER" });
      toast.success(`${regForm.role === "ADMIN" ? "Admin" : "Përdorues"} u regjistrua me sukses!`);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Gabim gjatë regjistrimit.";
      setRegError(typeof msg === "string" ? msg : "Gabim gjatë regjistrimit.");
    } finally {
      setRegLoading(false);
    }
  };

const handleUpdateRoles = async () => {
  if (!superAdmin || !selectedUser) return;
  try {
    await usersAPI.updateRoles(selectedUser.id, selectedUser.roles);
    closeModal();
    fetchUsers();
  } catch (err) {
    console.error("Gabim gjatë update të roleve:", err);
  }
};
;

  // const updateRoles = async () => {
  //   if (!isAdmin || !selectedUser) return;
  //   try {
  //     await axios.put(
  //       `${API_BASE}/api/users/${selectedUser.id}/roles`,
  //       selectedUser.roles,
  //       { withCredentials: true }
  //     );
  //     closeModal();
  //     fetchUsers();
  //   } catch (err) { console.error(err); }
  // };

  const handleToggleStatus = async () => {
  if (!selectedUser) return;
  try {
    await usersAPI.toggleStatus(selectedUser.id);
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, status: u.status === "ACTIVE" ? "BLOCKED" : "ACTIVE" } : u));
    toast.success("Statusi i përdoruesit u ndryshua.");
    closeModal();
  } catch (err) {
    console.error("Gabim gjatë bllokimit:", err);
    toast.error("Nuk mund të ndryshohet statusi i përdoruesit.");
  }
};

  // const toggleStatus = async (userId) => {
  //   try {
  //     const token = localStorage.getItem("token"); // 1. Merre tokenin
      
  //     // 2. Dërgoje në header
  //     await axios.put(`${API_BASE}/api/users/${userId}/toggle-status`, {}, {
  //       headers: {
  //         Authorization: `Bearer ${token}`
  //       },
  //       withCredentials: true
  //     });
  
  //     // Përditëso listën lokalisht
  //     setUsers(users.map(u => u.id === userId ? { ...u, enabled: !u.enabled } : u));
  //   } catch (err) {
  //     console.error("Gabim gjatë bllokimit:", err);
  //     alert("Nuk mund të ndryshohet statusi i përdoruesit.");
  //   }
  // };

  const handleDeleteUser = async () => {
  if (!selectedUser) return;
  try {
    await usersAPI.deleteUser(selectedUser.id);
    closeModal();
    fetchUsers();
  } catch (err) {
    console.error(err);
  }
};

  // const deleteUser = async () => {
  //   if (!selectedUser) return;
  //   try {
  //     await axios.delete(`${API_BASE}/api/users/${selectedUser.id}`, {
  //       withCredentials: true,
  //     });
  //     closeModal();
  //     fetchUsers();
  //   } catch (err) { console.error(err); }
  // };

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
  const inputCls = "w-full bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFAE42]/60";

  // Regular admins only see users with USER role (not admins/superadmins)
  const displayedUsers = superAdmin
    ? users
    : users.filter(u => {
        const roles = u.roles || [];
        return roles.includes("USER") && !roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN");
      });

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-white">Menaxhimi i Përdoruesve</h1>
        <div className="flex items-center gap-3">
          {superAdmin && (
            <button
              onClick={() => { setShowRegForm(true); setRegForm(f => ({ ...f, role: "USER" })); }}
              className="inline-flex items-center gap-2 bg-[#FFAE42]/10 border border-[#FFAE42]/30 text-[#FFAE42] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#FFAE42]/20 transition-colors"
            >
              <UserPlus size={14} /> Shto Përdorues
            </button>
          )}
          {superAdmin && (
            <button
              onClick={() => { setShowRegForm(true); setRegForm(f => ({ ...f, role: "ADMIN" })); }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ShieldCheck size={14} /> Shto Admin
            </button>
          )}
          <div className="flex items-center bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 gap-2 w-full sm:w-72">
            <Search size={14} className="text-white/40 shrink-0" />
            <input className="bg-transparent text-white text-sm outline-none w-full placeholder-white/30"
              placeholder="Kërko username ose email" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      {/* Register Form (SuperAdmin only) */}
      {superAdmin && showRegForm && (
        <div className="bg-[#111111] border border-[#FFAE42]/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#FFAE42]" />
              <h2 className="text-white font-semibold text-sm">
                Regjistro {regForm.role === "ADMIN" ? "Admin" : "Përdorues"} të Ri
              </h2>
            </div>
            <button onClick={() => setShowRegForm(false)} className="text-white/40 hover:text-white text-lg leading-none">×</button>
          </div>
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              className={inputCls}
              placeholder="Username"
              value={regForm.username}
              onChange={e => setRegForm(f => ({ ...f, username: e.target.value }))}
              required
            />
            <input
              className={inputCls}
              type="email"
              placeholder="Email"
              value={regForm.email}
              onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))}
              required
            />
            <input
              className={inputCls}
              type="password"
              placeholder="Fjalëkalimi"
              value={regForm.password}
              onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
            />
            <select
              className={inputCls}
              value={regForm.role}
              onChange={e => setRegForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="USER">Përdorues (USER)</option>
              <option value="ADMIN">Admin (ADMIN)</option>
            </select>
            {regError && <p className="col-span-full text-red-400 text-xs">{regError}</p>}
            <button
              type="submit"
              disabled={regLoading}
              className="col-span-full sm:col-span-1 py-2 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              {regLoading ? "Duke regjistruar..." : "Regjistro"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#111111] rounded-xl border border-white/10 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-white/40">Duke u ngarkuar...</div>
        ) : (
          <table className="w-full text-sm min-w-125">
            <thead>
              <tr className="border-b border-white/10">
                {["Përdoruesi", "Roles", "Statusi", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FFAE42]/20 text-[#FFAE42] flex items-center justify-center text-sm font-bold shrink-0">
                        {u.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{u.username}</p>
                        <p className="text-xs text-white/40">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{u.roles?.join(", ") || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === "ACTIVE" ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-400"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal("view", u)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"><Eye size={14} /></button>
                      <button onClick={() => openModal("edit", u)} className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FFAE42]/15 hover:text-[#FFAE42] text-white/50 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => openModal("status", u)} className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/15 hover:text-yellow-400 text-white/50 transition-colors"><Ban size={14} /></button>
                      <button onClick={() => openModal("delete", u)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/15 hover:text-red-400 text-white/50 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!displayedUsers || displayedUsers.length === 0) && (
                <tr><td colSpan={4} className="text-center py-6 text-white/30">Nuk ka përdorues.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 mt-6">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">← Prev</button>
        <span className="text-sm text-white/50">Faqja {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
          className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white disabled:opacity-30 transition-colors">Next →</button>
      </div>

      {/* Modal */}
      {modalType && selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            {modalType === "view" && (
              <>
                <h3 className="text-white font-semibold text-lg mb-4">Detajet e Përdoruesit</h3>
                {[["Username", selectedUser.username], ["Email", selectedUser.email], ["Status", selectedUser.status], ["Roles", selectedUser.roles?.join(", ") || "N/A"]].map(([l, v]) => (
                  <div key={l} className="flex gap-2 mb-2">
                    <span className="text-white/40 text-sm w-20 shrink-0">{l}:</span>
                    <span className="text-white text-sm">{v}</span>
                  </div>
                ))}
              </>
            )}
            {modalType === "edit" && (
              <>
                <h3 className="text-white font-semibold text-lg mb-4">Edit Përdorues</h3>
                <label className="block text-xs text-white/40 mb-1 uppercase tracking-wider">Email</label>
                <input className={`${inputCls} mb-3`} value={selectedUser.email || ""} onChange={(e) => isAdmin && setSelectedUser({ ...selectedUser, email: e.target.value })} disabled={!isAdmin} />
                <label className="block text-xs text-white/40 mb-1 uppercase tracking-wider">Roles (CTRL+click për shumë)</label>
                {superAdmin ? (
                  <>
                    <select className={`${inputCls} mb-4`} multiple value={selectedUser.roles || []}
                      onChange={(e) => setSelectedUser({ ...selectedUser, roles: Array.from(e.target.selectedOptions).map(o => o.value) })}
                      size={3}>
                      <option value="ROLE_USER">USER</option>
                      <option value="ROLE_ADMIN">ADMIN</option>
                      <option value="ROLE_SUPER_ADMIN">SUPER ADMIN</option>
                    </select>
                    <div className="flex gap-2">
                      <button onClick={handleUpdateEmail} className="flex-1 py-2 text-sm rounded-lg bg-[#FFAE42] hover:bg-[#e09a35] text-black font-medium transition-colors">Ruaj Email</button>
                      <button onClick={handleUpdateRoles} className="flex-1 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors">Ruaj Role</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-white/50 mb-3 bg-white/5 rounded-lg px-3 py-2">{selectedUser.roles?.join(", ") || "—"}</p>
                    <button onClick={handleUpdateEmail} className="w-full py-2 text-sm rounded-lg bg-[#FFAE42] hover:bg-[#e09a35] text-black font-medium transition-colors">Ruaj Email</button>
                  </>
                )}
              </>
            )}
            {modalType === "status" && (
              <>
                <h3 className="text-white font-semibold text-lg mb-2">Konfirmim</h3>
                <p className="text-white/60 text-sm mb-6">A je i sigurt që dëshiron të <b className="text-white">{selectedUser.status === "ACTIVE" ? "bllokosh" : "aktivizosh"}</b> këtë përdorues?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">Anulo</button>
                  <button onClick={handleToggleStatus} className="px-4 py-2 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-medium transition-colors">Po, vazhdo</button>
                </div>
              </>
            )}
            {modalType === "delete" && (
              <>
                <h3 className="text-white font-semibold text-lg mb-2">Fshirje</h3>
                <p className="text-white/60 text-sm mb-6">Ky veprim është i pakthyeshëm. A dëshiron të fshish <b className="text-white">{selectedUser.username}</b>?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">Anulo</button>
                  <button onClick={handleDeleteUser} className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors">Fshij</button>
                </div>
              </>
            )}
            {modalType !== "delete" && modalType !== "status" && (
              <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
                <button onClick={closeModal} className="px-4 py-2 text-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">Mbyll</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

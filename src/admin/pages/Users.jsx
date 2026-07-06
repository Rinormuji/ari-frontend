import React, { useEffect, useState } from "react";
import { Ban, Eye, Pencil, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { usersAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const PAGE_SIZE = 10;

const initialRegForm = {
  name: "",
  surname: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  role: "USER",
  enabled: true,
};

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

  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState(initialRegForm);
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getUsers({ page: page - 1, size: PAGE_SIZE, search });
      const data = res.data;
      const content = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      setUsers(content);
      setTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching users", err);
      setUsers([]);
      toast.error("Perdoruesit nuk mund te ngarkohen.");
    } finally {
      setLoading(false);
    }
  };

  const openRegisterForm = (role = "USER") => {
    setRegForm({ ...initialRegForm, role: superAdmin ? role : "USER" });
    setRegErrors({});
    setRegError("");
    setShowRegForm(true);
  };

  const handleRegChange = (e) => {
    const { name, type, checked, value } = e.target;
    setRegForm((form) => ({ ...form, [name]: type === "checkbox" ? checked : value }));
    setRegErrors((errors) => ({ ...errors, [name]: "" }));
  };

  const validateRegisterForm = () => {
    const errors = {};
    if (!regForm.name.trim()) errors.name = "Shkruani emrin";
    if (!regForm.surname.trim()) errors.surname = "Shkruani mbiemrin";
    if (!regForm.username.trim()) errors.username = "Shkruani username";
    if (!regForm.email.trim()) errors.email = "Shkruani email";
    else if (!/^\S+@\S+\.\S+$/.test(regForm.email)) errors.email = "Email-i nuk eshte valid";
    if (!regForm.phone.trim()) errors.phone = "Shkruani numrin e telefonit";
    else if (regForm.phone.trim().length < 8) errors.phone = "Numri i telefonit eshte i shkurter";
    if (!regForm.password) errors.password = "Shkruani password";
    else if (regForm.password.length < 6) errors.password = "Minimumi 6 karaktere";
    if (!regForm.confirmPassword) errors.confirmPassword = "Konfirmoni password-in";
    else if (regForm.password !== regForm.confirmPassword) errors.confirmPassword = "Password-et nuk perputhen";
    if (regForm.role === "ADMIN" && !superAdmin) errors.role = "Vetem super-admini mund te krijoje admin.";
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setRegLoading(true);
    setRegError("");
    try {
      const payload = {
        firstName: regForm.name.trim(),
        lastName: regForm.surname.trim(),
        username: regForm.username.trim(),
        email: regForm.email.trim(),
        phoneNumber: regForm.phone.trim(),
        password: regForm.password,
        enabled: regForm.enabled,
      };

      if (regForm.role === "ADMIN") {
        await usersAPI.registerAdmin(payload);
      } else {
        await usersAPI.registerUser(payload);
      }

      toast.success(`${regForm.role === "ADMIN" ? "Admin" : "Perdorues"} u krijua me sukses.`);
      setShowRegForm(false);
      setRegForm(initialRegForm);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || "Gabim gjate regjistrimit.";
      setRegError(typeof msg === "string" ? msg : "Gabim gjate regjistrimit.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!selectedUser) return;
    try {
      await usersAPI.updateEmail(selectedUser.id, selectedUser.email);
      toast.success("Email-i u perditesua.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gabim gjate perditesimit te email-it:", err);
      toast.error("Email-i nuk mund te perditesohet.");
    }
  };

  const handleUpdateRoles = async () => {
    if (!superAdmin || !selectedUser) return;
    try {
      await usersAPI.updateRoles(selectedUser.id, selectedUser.roles || ["USER"]);
      toast.success("Roli u perditesua.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gabim gjate update te roleve:", err);
      toast.error("Roli nuk mund te perditesohet.");
    }
  };

  const handleUpdateStatus = async (status = selectedUser?.status) => {
    if (!selectedUser || !status) return;
    try {
      await usersAPI.updateStatus(selectedUser.id, status);
      toast.success("Statusi u perditesua.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gabim gjate update te statusit:", err);
      toast.error("Statusi nuk mund te perditesohet.");
    }
  };

  const handleUpdateEnabled = async (enabled = selectedUser?.enabled) => {
    if (!selectedUser) return;
    try {
      await usersAPI.updateEnabled(selectedUser.id, !!enabled);
      toast.success(enabled ? "Perdoruesi u aktivizua." : "Perdoruesi u deaktivizua.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gabim gjate update te aktivizimit:", err);
      toast.error("Aktivizimi nuk mund te perditesohet.");
    }
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const updates = [
        usersAPI.updateEmail(selectedUser.id, selectedUser.email),
        usersAPI.updateStatus(selectedUser.id, selectedUser.status || "ACTIVE"),
        usersAPI.updateEnabled(selectedUser.id, !!selectedUser.enabled),
      ];

      if (superAdmin) {
        updates.push(usersAPI.updateRoles(selectedUser.id, selectedUser.roles || ["USER"]));
      }

      await Promise.all(updates);
      toast.success("Perdoruesi u perditesua.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error("Gabim gjate ruajtjes se perdoruesit:", err);
      toast.error("Ndryshimet nuk mund te ruhen.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await usersAPI.deleteUser(selectedUser.id);
      toast.success("Perdoruesi u fshi.");
      closeModal();
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Perdoruesi nuk mund te fshihet.");
    }
  };

  const openModal = (type, user) => {
    setSelectedUser({ ...user });
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const inputCls = "w-full bg-[#0f0f0f] border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#EFD391]/60";
  const err = (field) => regErrors[field] ? <p className="text-red-400 text-xs mt-1">{regErrors[field]}</p> : null;

  const displayedUsers = superAdmin
    ? users
    : users.filter((u) => {
        const roles = u.roles || [];
        return roles.includes("USER") && !roles.includes("ADMIN") && !roles.includes("SUPER_ADMIN");
      });

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
        <h1 className="text-xl font-bold text-white">Menaxhimi i Perdoruesve</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {isAdmin && (
            <button
              onClick={() => openRegisterForm("USER")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#EFD391]/30 bg-[#EFD391]/10 px-3 py-2 text-xs font-semibold text-[#EFD391] transition-colors hover:bg-[#EFD391]/20"
            >
              <UserPlus size={14} /> Shto Perdorues
            </button>
          )}
          {superAdmin && (
            <button
              onClick={() => openRegisterForm("ADMIN")}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
            >
              <ShieldCheck size={14} /> Shto Admin
            </button>
          )}
          <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-[#123E35] px-3 py-2 sm:w-72">
            <Search size={14} className="shrink-0 text-white/40" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder-white/30"
              placeholder="Kerko username ose email"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {isAdmin && showRegForm && (
        <div className="mb-6 rounded-2xl border border-[#EFD391]/20 bg-[#0F4638] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {regForm.role === "ADMIN" ? <ShieldCheck size={16} className="text-[#EFD391]" /> : <UserPlus size={16} className="text-[#EFD391]" />}
              <h2 className="text-sm font-semibold text-white">
                Regjistro {regForm.role === "ADMIN" ? "Admin" : "Perdorues"} te Ri
              </h2>
            </div>
            <button onClick={() => setShowRegForm(false)} className="text-lg leading-none text-white/40 hover:text-white">x</button>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <input className={inputCls} name="name" placeholder="Emri" value={regForm.name} onChange={handleRegChange} />
              {err("name")}
            </div>
            <div>
              <input className={inputCls} name="surname" placeholder="Mbiemri" value={regForm.surname} onChange={handleRegChange} />
              {err("surname")}
            </div>
            <div>
              <input className={inputCls} name="username" placeholder="Username" value={regForm.username} onChange={handleRegChange} />
              {err("username")}
            </div>
            <div>
              <input className={inputCls} name="email" type="email" placeholder="Email" value={regForm.email} onChange={handleRegChange} />
              {err("email")}
            </div>
            <div>
              <input className={inputCls} name="phone" placeholder="Telefoni" value={regForm.phone} onChange={handleRegChange} />
              {err("phone")}
            </div>
            <div>
              <input className={inputCls} name="password" type="password" placeholder="Fjalekalimi" value={regForm.password} onChange={handleRegChange} />
              {err("password")}
            </div>
            <div>
              <input className={inputCls} name="confirmPassword" type="password" placeholder="Konfirmo fjalekalimin" value={regForm.confirmPassword} onChange={handleRegChange} />
              {err("confirmPassword")}
            </div>
            {superAdmin ? (
              <div>
                <select className={inputCls} name="role" value={regForm.role} onChange={handleRegChange}>
                  <option value="USER">Perdorues (USER)</option>
                  <option value="ADMIN">Admin (ADMIN)</option>
                </select>
                {err("role")}
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60">Roli: USER</div>
            )}
            <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
              <input
                type="checkbox"
                name="enabled"
                checked={regForm.enabled}
                onChange={handleRegChange}
                className="h-4 w-4 rounded border-white/20 bg-[#0f0f0f] accent-[#EFD391]"
              />
              Aktivizo menjehere
            </label>
            {!regForm.enabled && (
              <p className="rounded-lg border border-[#EFD391]/20 bg-[#EFD391]/10 px-3 py-2 text-xs text-[#EFD391] lg:col-span-3">
                User-i do te krijohet i paaktivizuar dhe do t'i dergohet email per verifikim.
              </p>
            )}

            {regError && <p className="col-span-full text-xs text-red-400">{regError}</p>}
            <button
              type="submit"
              disabled={regLoading}
              className="col-span-full rounded-lg bg-[#EFD391] py-2 text-sm font-semibold text-black transition-colors hover:bg-[#D9BF7B] disabled:opacity-50 sm:col-span-1"
            >
              {regLoading ? "Duke regjistruar..." : "Regjistro"}
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0F4638]">
        {loading ? (
          <div className="p-8 text-center text-white/40">Duke u ngarkuar...</div>
        ) : (
          <table className="w-full min-w-125 text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {["Perdoruesi", "Roli", "Statusi", "Aktivizimi", ""].map((header) => (
                  <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/5 transition-colors hover:bg-white/3">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EFD391]/20 text-sm font-bold text-[#EFD391]">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.username}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-white/50">{user.roles?.join(", ") || "-"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.status === "ACTIVE" ? "bg-green-500/15 text-green-300" : user.status === "PENDING" ? "bg-yellow-500/15 text-yellow-300" : "bg-red-500/15 text-red-400"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${user.enabled ? "bg-emerald-500/15 text-emerald-300" : "bg-orange-500/15 text-orange-300"}`}>
                      {user.enabled ? "Aktiv" : "Pret email"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal("view", user)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"><Eye size={14} /></button>
                      <button onClick={() => openModal("edit", user)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-[#EFD391]/15 hover:text-[#EFD391]"><Pencil size={14} /></button>
                      <button onClick={() => openModal("status", user)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-yellow-500/15 hover:text-yellow-400"><Ban size={14} /></button>
                      <button onClick={() => openModal("delete", user)} className="rounded-lg bg-white/5 p-1.5 text-white/50 transition-colors hover:bg-red-500/15 hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-white/30">Nuk ka perdorues.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-30">Prev</button>
        <span className="text-sm text-white/50">Faqja {page} / {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/60 transition-colors hover:text-white disabled:opacity-30">Next</button>
      </div>

      {modalType && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#123E35] p-6 shadow-2xl">
            {modalType === "view" && (
              <>
                <h3 className="mb-4 text-lg font-semibold text-white">Detajet e Perdoruesit</h3>
                {[
                  ["Username", selectedUser.username],
                  ["Email", selectedUser.email],
                  ["Status", selectedUser.status],
                  ["Aktivizimi", selectedUser.enabled ? "Aktiv" : "Pret email / jo aktiv"],
                  ["Roles", selectedUser.roles?.join(", ") || "N/A"],
                ].map(([label, value]) => (
                  <div key={label} className="mb-2 flex gap-2">
                    <span className="w-20 shrink-0 text-sm text-white/40">{label}:</span>
                    <span className="text-sm text-white">{value}</span>
                  </div>
                ))}
              </>
            )}

            {modalType === "edit" && (
              <>
                <h3 className="mb-4 text-lg font-semibold text-white">Edito Perdorues</h3>
                <label className="mb-1 block text-xs uppercase tracking-wider text-white/40">Email</label>
                <input className={`${inputCls} mb-3`} value={selectedUser.email || ""} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />

                <label className="mb-1 block text-xs uppercase tracking-wider text-white/40">Statusi</label>
                <select className={`${inputCls} mb-3`} value={selectedUser.status || "ACTIVE"} onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="PENDING">PENDING</option>
                </select>

                <label className="mb-1 block text-xs uppercase tracking-wider text-white/40">Aktivizimi i login-it</label>
                <label className="mb-3 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={!!selectedUser.enabled}
                    onChange={(e) => setSelectedUser({ ...selectedUser, enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-white/20 bg-[#0f0f0f] accent-[#EFD391]"
                  />
                  {selectedUser.enabled ? "I aktivizuar" : "I paaktivizuar"}
                </label>

                <label className="mb-1 block text-xs uppercase tracking-wider text-white/40">Roli</label>
                {superAdmin ? (
                  <select className={`${inputCls} mb-4`} value={selectedUser.roles?.[0] || "USER"} onChange={(e) => setSelectedUser({ ...selectedUser, roles: [e.target.value] })}>
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER ADMIN</option>
                  </select>
                ) : (
                  <p className="mb-4 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/50">{selectedUser.roles?.join(", ") || "-"}</p>
                )}

                <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-4">
                  <button onClick={closeModal} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Anulo</button>
                  <button onClick={handleSaveUser} className="rounded-lg bg-[#EFD391] px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-[#D9BF7B]">Ruaj</button>
                </div>
              </>
            )}

            {modalType === "status" && (
              <>
                <h3 className="mb-2 text-lg font-semibold text-white">Ndrysho statusin</h3>
                <p className="mb-4 text-sm text-white/60">Zgjedh statusin per <b className="text-white">{selectedUser.username}</b>.</p>
                <select className={`${inputCls} mb-6`} value={selectedUser.status || "ACTIVE"} onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="BLOCKED">BLOCKED</option>
                  <option value="PENDING">PENDING</option>
                </select>
                <div className="flex justify-end gap-3">
                  <button onClick={closeModal} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Anulo</button>
                  <button onClick={() => handleUpdateStatus()} className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-yellow-600">Ruaj statusin</button>
                </div>
              </>
            )}

            {modalType === "delete" && (
              <>
                <h3 className="mb-2 text-lg font-semibold text-white">Fshirje</h3>
                <p className="mb-6 text-sm text-white/60">Ky veprim eshte i pakthyeshem. A deshiron te fshish <b className="text-white">{selectedUser.username}</b>?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={closeModal} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Anulo</button>
                  <button onClick={handleDeleteUser} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600">Fshij</button>
                </div>
              </>
            )}

            {modalType !== "delete" && modalType !== "status" && modalType !== "edit" && (
              <div className="mt-4 flex justify-end border-t border-white/10 pt-4">
                <button onClick={closeModal} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:text-white">Mbyll</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

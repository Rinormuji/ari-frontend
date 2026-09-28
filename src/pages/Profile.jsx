import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { paths } from "../routes/paths";
import api from "../services/api";
import { useAuth } from "../context/authContextValue";

const API_PATH = "/profile";

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    username: user?.username || "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get(API_PATH)
      .then(({ data }) => {
        if (active) {
          setProfile({
            username: data.username || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phoneNumber: data.phoneNumber || "",
          });
          setProfileLoaded(true);
        }
      })
      .catch(() => {
        if (active) setError("Të dhënat e profilit nuk u ngarkuan. Rifreskoni faqen dhe provoni përsëri.");
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    return () => { active = false; };
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setError("");
    setMessage("");
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPwError("");
    setPwMessage("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await api.put(API_PATH, profile);
      setProfile({
        username: data.username || "",
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phoneNumber: data.phoneNumber || "",
      });
      await refreshUser();
      setMessage("Profili u përditësua me sukses!");
      setTimeout(() => setMessage(""), 3000); // zhduket pas 3 sek
    } catch (err) {
      setError(
        err.response?.data?.message || "Gabim gjatë përditësimit, provo përsëri."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError("Fjalëkalimet nuk përputhen!");
      return;
    }
    setPwLoading(true);
    setPwMessage("");
    setPwError("");

    try {
      await api.put(`${API_PATH}/password`, passwords);
      setPwMessage("Fjalëkalimi u ndryshua me sukses!");
      setTimeout(() => setPwMessage(""), 3000); // zhduket pas 3 sek
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordFields(false); // fsheh fushat pas ndryshimit
    } catch (err) {
      setPwError(
        err.response?.data?.message || "Gabim gjatë ndryshimit të fjalëkalimit."
      );
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg mx-auto space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profili juaj</h1>
          <Link to={paths.preferences} className="mt-3 inline-block rounded-xl bg-[#0F4638] px-4 py-2 text-sm font-semibold text-white">Preferencat dhe njoftimet e pronave</Link>
          <p className="text-sm text-gray-500 mt-1">Shikoni ose përditësoni informacionin tuaj</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {loadingProfile && <p role="status" className="text-sm text-[#0F4638]/65">Duke ngarkuar të dhënat e profilit...</p>}
            <div>
              <label htmlFor="profile-first-name" className="mb-1.5 block text-sm font-semibold text-[#0F4638]">Emri</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input id="profile-first-name" type="text" name="firstName" autoComplete="given-name" placeholder="Emri" value={profile.firstName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
              </div>
            </div>
            <div>
              <label htmlFor="profile-last-name" className="mb-1.5 block text-sm font-semibold text-[#0F4638]">Mbiemri</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input id="profile-last-name" type="text" name="lastName" autoComplete="family-name" placeholder="Mbiemri" value={profile.lastName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
              </div>
            </div>
            <div>
              <label htmlFor="profile-username" className="mb-1.5 block text-sm font-semibold text-[#0F4638]">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input id="profile-username" type="text" name="username" autoComplete="username" placeholder="Username" value={profile.username} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
              </div>
            </div>
            <div>
              <label htmlFor="profile-phone" className="mb-1.5 block text-sm font-semibold text-[#0F4638]">Numri i telefonit</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input id="profile-phone" type="tel" name="phoneNumber" autoComplete="tel" placeholder="Numri i telefonit" value={profile.phoneNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
              </div>
            </div>

            {message && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading || !profileLoaded} className="w-full py-3 bg-[#EFD391] hover:bg-[#D9BF7B] disabled:opacity-60 text-black font-semibold rounded-xl transition-colors text-sm">
              {loading ? "Duke përditësuar..." : "Përditëso Profilin"}
            </button>
          </form>

          <hr className="my-6 border-gray-100" />

          {/* Password toggle */}
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            <Key size={16} />
            {showPasswordFields ? "Anulo Ndryshimin e Fjalëkalimit" : "Ndrysho Fjalëkalimin"}
          </button>

          <AnimatePresence>
            {showPasswordFields && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-4"
              >
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="password" name="currentPassword" placeholder="Fjalëkalimi aktual" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
                  </div>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="password" name="newPassword" placeholder="Fjalëkalimi i ri" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
                  </div>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input type="password" name="confirmPassword" placeholder="Konfirmo fjalëkalimin" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EFD391]/40 focus:border-[#EFD391] outline-none transition" required />
                  </div>

                  {pwMessage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                      {pwMessage}
                    </motion.div>
                  )}
                  {pwError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {pwError}
                    </motion.div>
                  )}

                  <button type="submit" disabled={pwLoading} className="w-full flex items-center justify-center gap-2 py-3 bg-[#EFD391] hover:bg-[#D9BF7B] disabled:opacity-60 text-black font-semibold rounded-xl transition-colors text-sm">
                    {pwLoading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                    {pwLoading ? "Duke përditësuar..." : "Ndrysho Fjalëkalimin"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;

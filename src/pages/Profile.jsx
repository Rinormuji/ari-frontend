import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Phone, Key } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:8080/api/profile";

const Profile = () => {
  const [profile, setProfile] = useState({
    username: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
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

  // Merr profilin e user-it
  useEffect(() => {
    axios
      .get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => console.error(err));
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
      await axios.put(API_URL, profile, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
      await axios.put(`${API_URL}/password`, passwords, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
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
    <div className="forgot-wrapper-uni">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="forgot-card-uni"
      >
        <h2 className="forgot-title-uni">Profili juaj</h2>
        <p className="forgot-desc-uni">Shikoni ose përditësoni informacionin tuaj</p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Username */}
            <div className="forgot-input-wrapper-uni">
              <User className="forgot-input-icon-left" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={profile.username}
                onChange={handleChange}
                className="forgot-input-uni"
                required
              />
            </div>

            {/* First Name */}
            <div className="forgot-input-wrapper-uni">
              <User className="forgot-input-icon-left" />
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={profile.firstName}
                onChange={handleChange}
                className="forgot-input-uni"
                required
              />
            </div>

            {/* Last Name */}
            <div className="forgot-input-wrapper-uni">
              <User className="forgot-input-icon-left" />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={profile.lastName}
                onChange={handleChange}
                className="forgot-input-uni"
                required
              />
            </div>

            {/* Phone */}
            <div className="forgot-input-wrapper-uni">
              <Phone className="forgot-input-icon-left" />
              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={profile.phoneNumber}
                onChange={handleChange}
                className="forgot-input-uni"
                required
              />
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm"
              >
                {message}
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="forgot-btn-uni">
              {loading ? "Duke përditësuar..." : "Përditëso Profilin"}
            </button>
          </form>

          <hr className="my-6" />

          {/* Toggle Password Fields */}
          <button
            onClick={() => setShowPasswordFields(!showPasswordFields)}
            className="forgot-btn-uni flex items-center justify-center gap-2"
          >
            <Key />
            {showPasswordFields ? "Anulo Ndryshimin e Fjalëkalimit" : "Ndrysho Fjalëkalimin"}
          </button>

          <AnimatePresence>
            {showPasswordFields && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden mt-4 space-y-4"
              >
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="forgot-input-wrapper-uni mt-2"  style={{ marginTop: '12px' }}>
                    <Key className="forgot-input-icon-left" />
                    <input
                      type="password"
                      name="currentPassword"
                      placeholder="Fjalëkalimi aktual"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className="forgot-input-uni"
                      required
                    />
                  </div>

                  <div className="forgot-input-wrapper-uni">
                    <Key className="forgot-input-icon-left" />
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Fjalëkalimi i ri"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className="forgot-input-uni"
                      required
                    />
                  </div>

                  <div className="forgot-input-wrapper-uni">
                    <Key className="forgot-input-icon-left" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Konfirmo fjalëkalimin"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className="forgot-input-uni"
                      required
                    />
                  </div>

                  {pwMessage && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {pwMessage}
                    </motion.div>
                  )}

                  {pwError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
                    >
                      {pwError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="forgot-btn-uni flex items-center justify-center gap-2"
                  >
                    {pwLoading && (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {pwLoading ? "Duke përditësuar..." : "Ndrysho Fjalëkalimin"}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;

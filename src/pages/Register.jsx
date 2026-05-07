import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { ArrowLeft, Eye, EyeOff, User, Mail, Phone, Lock } from "lucide-react";
import { useToast } from "../context/ToastContext";
import logo2 from "../assets/images/logo2.png";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "", surname: "", username: "", email: "", phone: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    setErrors({ ...errors, phone: "" });
  };

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Shkruani emrin";
    if (!formData.surname.trim()) e.surname = "Shkruani mbiemrin";
    if (!formData.username.trim()) e.username = "Shkruani username";
    if (!formData.email.trim()) e.email = "Shkruani email";
    if (!formData.phone.trim()) e.phone = "Shkruani numrin e telefonit";
    else if (formData.phone.length < 8) e.phone = "Numri i telefonit eshte i shkurter";
    if (!formData.password) e.password = "Shkruani password";
    else if (formData.password.length < 6) e.password = "Minimumi 6 karaktere";
    if (!formData.confirmPassword) e.confirmPassword = "Konfirmoni password-in";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Password-et nuk perputhen";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        firstName: formData.name, lastName: formData.surname,
        username: formData.username, email: formData.email,
        phoneNumber: formData.phone, password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      toast.success("Regjistrimi u krye! Kontrolloni email-in per verifikim.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Ka ndodhur nje gabim ne server";
      if (msg.toLowerCase().includes("username")) setErrors((p) => ({ ...p, username: msg }));
      else if (msg.toLowerCase().includes("email")) setErrors((p) => ({ ...p, email: msg }));
      else if (msg.toLowerCase().includes("phone")) setErrors((p) => ({ ...p, phone: msg }));
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl text-sm py-3 px-4 focus:ring-2 focus:ring-[#FFAE42]/50 focus:border-[#FFAE42] outline-none transition";
  const err = (field) => errors[field] ? <p className="text-red-400 text-xs mt-1">{errors[field]}</p> : null;

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-[#0a0a0a] border-r border-white/5 p-12">
        <img src={logo2} alt="Ari Real Estate" className="h-14 w-auto" />
        <div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-4">Krijo llogarinë<br/>tënde sot</h2>
          <p className="text-gray-400 text-sm leading-relaxed">Bashkohuni me komunitetin tonë dhe gjeni pronën e ëndrrave tuaja.</p>
        </div>
        <p className="text-xs text-white/20">© {new Date().getFullYear()} Ari Real Estate</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <img src={logo2} alt="Ari Real Estate" className="h-12 mx-auto mb-8 lg:hidden" />

          <h1 className="text-2xl font-bold text-white mb-1">Regjistrohu</h1>
          <p className="text-sm text-white/40 mb-8">Hap llogarinë tënde falas</p>

          {/* Custom phone-input overrides */}
          <style>{`
            .react-tel-input .form-control {
              background: rgba(255,255,255,0.05) !important;
              border: 1px solid rgba(255,255,255,0.10) !important;
              color: white !important;
              border-radius: 0.75rem !important;
              font-size: 0.875rem !important;
              padding-top: 0.75rem !important;
              padding-bottom: 0.75rem !important;
              width: 100% !important;
            }
            .react-tel-input .form-control::placeholder { color: rgba(255,255,255,0.30) !important; }
            .react-tel-input .form-control:focus { border-color: #FFAE42 !important; outline: none !important; box-shadow: 0 0 0 2px rgba(255,174,66,0.25) !important; }
            .react-tel-input .flag-dropdown { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.10) !important; border-radius: 0.75rem 0 0 0.75rem !important; }
            .react-tel-input .selected-flag:hover, .react-tel-input .selected-flag:focus { background: rgba(255,255,255,0.08) !important; }
            .react-tel-input .country-list { background: #1a1a1a !important; border: 1px solid rgba(255,255,255,0.10) !important; }
            .react-tel-input .country-list .country:hover { background: rgba(255,174,66,0.1) !important; }
            .react-tel-input .country-list .country-name { color: white !important; }
            .react-tel-input .country-list .dial-code { color: rgba(255,255,255,0.4) !important; }
          `}</style>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name + Surname */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="text" name="name" placeholder="Emri" value={formData.name} onChange={handleChange} className={inp} required />
                {err("name")}
              </div>
              <div>
                <input type="text" name="surname" placeholder="Mbiemri" value={formData.surname} onChange={handleChange} className={inp} required />
                {err("surname")}
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className={`${inp} pl-10`} required />
              </div>
              {err("username")}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className={`${inp} pl-10`} required />
              </div>
              {err("email")}
            </div>

            {/* Phone */}
            <div>
              <PhoneInput
                country="xk"
                value={formData.phone}
                onChange={handlePhoneChange}
                inputProps={{ name: "phone", required: true }}
                containerClass="w-full"
              />
              {err("phone")}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input type={showPw ? "text" : "password"} name="password" placeholder="Fjalëkalimi" value={formData.password} onChange={handleChange} className={`${inp} pl-10 pr-10`} required />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err("password")}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input type={showCPw ? "text" : "password"} name="confirmPassword" placeholder="Konfirmo fjalëkalimin" value={formData.confirmPassword} onChange={handleChange} className={`${inp} pl-10 pr-10`} required />
                <button type="button" onClick={() => setShowCPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err("confirmPassword")}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFAE42] hover:bg-[#e09a35] disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm mt-1"
            >
              {loading ? "Po regjistrohemi..." : "Regjistrohu"}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Tashmë keni llogari?{" "}
            <Link to="/login" className="text-[#FFAE42] hover:underline font-medium">Kyçuni këtu</Link>
          </p>

          <div className="mt-6 pt-4 border-t border-white/5">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
              <ArrowLeft size={13} /> Kthehu te Ballina
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
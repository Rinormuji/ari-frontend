import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { ArrowLeft } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
    setErrors({ ...errors, phone: "" });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Shkruani emrin";
    if (!formData.surname.trim()) newErrors.surname = "Shkruani mbiemrin";
    if (!formData.username.trim()) newErrors.username = "Shkruani username";
    if (!formData.email.trim()) newErrors.email = "Shkruani email";
    if (!formData.phone.trim()) newErrors.phone = "Shkruani numrin e telefonit";
    else if (formData.phone.length < 8) newErrors.phone = "Numri i telefonit është i shkurtër";
    if (!formData.password) newErrors.password = "Shkruani password";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Konfirmoni password-in";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Password-et nuk përputhen";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        firstName: formData.name,
        lastName: formData.surname,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
  
      // ✅ Sukses me toast
      toast.success("Regjistrimi u krye! Kontrolloni email-in për verifikim.");

      // Navigim pas 2 sekondash
      setTimeout(() => {
        navigate("/login");
      }, 2000);
  
    } catch (err) {
      console.error(err);
  
      const msg = err.response?.data?.message || "Ka ndodhur një gabim në server";

      if (msg.toLowerCase().includes("username")) {
        setErrors((prev) => ({ ...prev, username: msg }));
      } else if (msg.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: msg }));
      } else if (msg.toLowerCase().includes("phone")) {
        setErrors((prev) => ({ ...prev, phone: msg }));
      } else {
        alert(msg);
      }
  
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="register-wrapper-uni">
      <div className="register-card-uni glass-effect shadow-prestige">
        <Link to="/" className="register-back-home-link">
          <ArrowLeft className="register-back-home-icon" /> Kthehu te Ballina
        </Link>

        <h2 className="register-title-uni text-gradient">Krijo Llogari</h2>
        <p className="register-subtitle-uni">
          Hap llogarinë tënde dhe eksploro mundësitë.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="register-input-group-uni">
            <input
              type="text"
              name="name"
              placeholder="Emri"
              value={formData.name}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Surname */}
          <div className="register-input-group-uni">
            <input
              type="text"
              name="surname"
              placeholder="Mbiemri"
              value={formData.surname}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.surname && <p className="text-red-600 text-sm mt-1">{errors.surname}</p>}
          </div>

          {/* Username */}
          <div className="register-input-group-uni">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          {/* Email */}
          <div className="register-input-group-uni">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div className="register-input-group-uni">
            <PhoneInput
              country="xk"
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{
                name: "phone",
                required: true,
              }}
              containerClass="w-full"
              inputClass="register-input-uni"
              enableAreaCodes
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="register-input-group-uni relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="register-input-group-uni relative">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="register-input-uni"
              required
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="register-btn-uni premium-gradient text-white shadow-prestige hover:brightness-110 transition-all duration-200"
            disabled={loading}
          >
            {loading ? "Po regjistrohemi..." : "Regjistrohu"}
          </button>
        </form>

        <div className="register-divider-uni">OSE</div>

        {/* <div className="register-socials-uni">
          <button
            type="button"
            className="register-social-btn-uni luxury-gradient text-white hover:brightness-105 transition-all duration-200"
            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/google"}
          >
            <GoogleIcon /> Register with Google
          </button>

          <button
            type="button"
            className="register-social-btn-uni luxury-gradient text-white hover:brightness-105 transition-all duration-200"
            onClick={() => window.location.href = "http://localhost:8080/oauth2/authorization/facebook"}
          >
            <FacebookIcon /> Register with Facebook
          </button>
        </div> */}

        <div className="register-login-link-uni mt-4 text-center">
          Tashmë keni llogari të hapur? <Link to="/login">Login</Link>
        </div>
      </div>

      {/* Toast container për notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default Register;

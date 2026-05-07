import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import api from "../services/api";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      api.get(`/auth/verify?token=${token}`)
        .then((res) => { setMessage(res.data); setStatus("success"); })
        .catch((err) => { setMessage(err.response?.data || "Verifikimi dështoi."); setStatus("error"); });
    } else {
      setMessage("Token i pavlefshëm.");
      setStatus("error");
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="w-10 h-10 rounded-full border-2 border-[#FFAE42] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Duke verifikuar...</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email u verifikua!</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/login" className="inline-flex items-center justify-center w-full py-3 bg-[#FFAE42] hover:bg-[#e09a35] text-black font-semibold rounded-xl transition-colors text-sm">
              Kyqu tani
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={40} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifikimi dështoi</h2>
            <p className="text-sm text-gray-500 mb-6">{message}</p>
            <Link to="/" className="inline-flex items-center justify-center w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm">
              Kthehu në fillim
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;

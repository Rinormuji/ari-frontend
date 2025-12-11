import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");
  
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      axios.get(`http://localhost:8080/api/auth/verify?token=${token}`)
        .then(res => setMessage(res.data))
        .catch(err => setMessage(err.response?.data || "Verification failed"));
    } else {
      setMessage("Invalid token");
    }
  }, [searchParams]);

  return (
    <div className="verify-page">
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default Verify;

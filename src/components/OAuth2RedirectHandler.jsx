import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // The backend already set the HttpOnly JWT cookie via the OAuth2 success handler.
    // Just fetch the current user and update context state.
    authAPI.me()
      .then((res) => {
        login(res.data);
      })
      .catch(() => {
        navigate("/login");
      });
  }, []);

  return <div className="p-8 text-center">Për momentin po përpunohet hyrja...</div>;
}

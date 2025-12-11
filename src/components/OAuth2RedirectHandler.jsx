import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function OAuth2RedirectHandler() {
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (!token) {
      // nuk ka token -> shko te login
      navigate("/login");
      return;
    }

    // Ruaj token në localStorage (ose cookie) dhe vendos header default
    try {
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (err) {
      console.error("Could not save token", err);
    }

    // Opsionale: kërko profilin nga backend (nëse ke endpoint /api/auth/me)
    // axios.get("/api/auth/me").then(res => {
    //   localStorage.setItem("user", JSON.stringify(res.data));
    //   navigate("/"); // ridrejto te home
    // }).catch(() => navigate("/"));

    // Thjesht ridrejto te home dhe ruaj user state në front
    navigate("/");
  }, [search, navigate]);

  return <div className="p-8 text-center">Për momentin po përpunohet hyrja...</div>;
}


// // src/components/OAuth2RedirectHandler.jsx
// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// export default function OAuth2RedirectHandler() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = searchParams.get("token");
//     const error = searchParams.get("error");
//     if (token) {
//       localStorage.setItem("token", token);
//       // optionally fetch user profile with token and store user
//       navigate("/", { replace: true });
//       window.location.reload(); // if you rely on app init to read token
//     } else {
//       console.error("OAuth2 redirect error:", error);
//       navigate("/login");
//     }
//   }, []);

//   return <div>Processing OAuth2 login...</div>;
// }

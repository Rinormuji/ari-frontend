import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import "./app.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <Router>              {/* 🔹 Router jashtë AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

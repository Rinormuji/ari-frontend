import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./app.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext.jsx"; // ⬅️ importo context-in

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>
);

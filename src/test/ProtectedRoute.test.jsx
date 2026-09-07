import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProtectedRoute from "../components/ProtectedRoute";
import { AuthContext } from "../context/authContextValue";

const authenticatedValue = {
  user: { username: "ari" },
  isAuthenticated: true,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  isAdmin: vi.fn(() => false),
  isSuperAdmin: vi.fn(() => false),
};

function LoginTarget() {
  const location = useLocation();
  return <p>Login target: {location.search}</p>;
}

function renderProtected(value, initialEntry = "/profile") {
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<h1>Profili</h1>} />
          </Route>
          <Route path="/login" element={<LoginTarget />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("ProtectedRoute", () => {
  it("renders private content for an authenticated user", () => {
    renderProtected(authenticatedValue);
    expect(screen.getByRole("heading", { name: "Profili" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users and preserves the intended URL", () => {
    renderProtected({ ...authenticatedValue, user: null, isAuthenticated: false }, "/profile?tab=security");
    expect(screen.getByText(/redirect=%2Fprofile%3Ftab%3Dsecurity/)).toBeInTheDocument();
  });

  it("shows a loading state while the session is checked", () => {
    renderProtected({ ...authenticatedValue, user: null, isAuthenticated: false, loading: true });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
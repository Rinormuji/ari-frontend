import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <Outlet /> {/* Këtu shfaqet Register ose Login */}
    </div>
  );
}
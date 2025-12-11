import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import { Outlet } from "react-router-dom"; // <- KY ËSHTË THELBËSOR

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminTopbar />

        <main className="p-6">
          <Outlet /> {/* <- Outlet vendos faqet e fëmijëve */}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

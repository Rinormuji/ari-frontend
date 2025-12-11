import '../admin.css';
import logo from '../../assets/images/logo.png'; // rruge relative

function AdminTopbar() {
  return (
    <header className="admin-topbar p-4 flex justify-between items-center">
      {/* Logo si image */}
      <div className="flex items-center">
      {/* <img src={logo} alt="Logo ARI Real Estate" className="admin-topbar-logo" /> */}
      </div>

      {/* User info */}
      <div className="flex items-center gap-3 text-white/80">
        <span>Admin</span>
      </div>
    </header>
  );
}

export default AdminTopbar;

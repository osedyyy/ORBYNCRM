import { Link, useLocation, useNavigate } from "react-router-dom";

const navLinks = [
  { label: "Overview", href: "/admin" },
  { label: "Tenants", href: "/admin#tenants" },
  { label: "Users", href: "/admin#users" },
];

function initialsFromEmail(email = "") {
  const [name] = email.split("@");
  return (name?.slice(0, 2) || "SA").toUpperCase();
}

export default function DashboardLayout({ title, subtitle, children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userEmail = typeof window !== "undefined" ? localStorage.getItem("user_email") : "";
  const tenantName = typeof window !== "undefined" ? localStorage.getItem("tenant_name") : "Master Tenant";
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : "superadmin";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50 flex">
      <aside className="hidden lg:flex w-64 bg-black/30 border-r border-white/5 flex-col gap-6 px-6 py-8 backdrop-blur-xl">
        <div className="text-left">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Orbyn CRM</p>
          <p className="text-2xl font-semibold text-white mt-1">Control Room</p>
          <p className="text-sm text-slate-400 mt-2">Super Admin</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href || location.hash === link.href.replace("/admin", "");
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition ${
                  isActive
                    ? "border-purple-400/50 bg-purple-500/10 text-white shadow-lg shadow-purple-900/50"
                    : "border-white/5 text-slate-200 hover:border-purple-500/40 hover:bg-white/5"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-sm font-semibold">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Session</p>
            <p className="text-sm text-white font-semibold mt-1">{tenantName || "Master Tenant"}</p>
            <p className="text-xs text-slate-400">{userEmail || "superadmin@crm"}</p>
            <p className="mt-2 inline-flex items-center gap-2 text-[11px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> {role || "superadmin"}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Super Admin</p>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{userEmail || "superadmin@crm"}</p>
              <p className="text-xs text-slate-400">Tenant: {tenantName || "master"}</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-900/60">
              {initialsFromEmail(userEmail)}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-12 pt-6 max-w-6xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load user and tenant info from localStorage
    const userEmail = localStorage.getItem("user_email");
    const userName = localStorage.getItem("user_name");
    const userRole = localStorage.getItem("role");
    const tenantName = localStorage.getItem("tenant_name");
    const tenantCode = localStorage.getItem("tenant_code");

    if (userEmail) {
      setUser({ email: userEmail, name: userName, role: userRole });
      setTenant({ name: tenantName, code: tenantCode });
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getInitials = (email = "") => {
    if (!email) return "U";
    const [name] = email.split("@");
    return (name?.slice(0, 2) || "U").toUpperCase();
  };

  const isActive = (path) => location.pathname === path;

  // Don't show navbar on login page
  if (location.pathname === "/" || location.pathname === "/login") {
    return null;
  }

  const isSuperAdmin = user?.role === "superadmin";
  const isManager = user?.role === "manager";

  return (
    <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-8">
            <Link to={isSuperAdmin ? "/admin" : "/crm"} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/60">
                <span className="text-xl font-bold text-white">O</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white">Orbyn CRM</p>
                <p className="text-xs text-slate-400">{tenant?.name || "Master"}</p>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {isSuperAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive("/admin")
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>
                  <a
                    href="/admin#tenants"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Companies
                  </a>
                  <a
                    href="/admin#users"
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Users
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/crm"
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive("/crm")
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    CRM
                  </Link>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Customers
                  </button>
                  {isManager && (
                    <button
                      className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      Reports
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            {/* Role Badge */}
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className={`h-2 w-2 rounded-full ${
                  isSuperAdmin ? "bg-red-400" : isManager ? "bg-amber-400" : "bg-emerald-400"
                }`} />
                <span className="text-xs font-medium text-slate-300 capitalize">{user.role || "User"}</span>
              </div>
            )}

            {/* User Profile Button */}
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-white">{user.name || user.email}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-900/60">
                  {getInitials(user.email)}
                </div>
              </div>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/50 text-sm font-semibold hover:bg-purple-500/30 transition-all"
              >
                Login
              </Link>
            )}

            {/* Logout Button */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 bg-red-500/10 text-sm font-semibold text-red-300 transition-all hover:border-red-500/50 hover:bg-red-500/20"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden xl:inline">Logout</span>
              </button>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {isSuperAdmin ? (
              <>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive("/admin")
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-slate-300"
                  }`}
                >
                  Dashboard
                </Link>
                <a
                  href="/admin#tenants"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-semibold text-slate-300"
                >
                  Companies
                </a>
                <a
                  href="/admin#users"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-semibold text-slate-300"
                >
                  Users
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/crm"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive("/crm")
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-slate-300"
                  }`}
                >
                  CRM
                </Link>
                <button className="block w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-slate-300">
                  Customers
                </button>
                {isManager && (
                  <button className="block w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-slate-300">
                    Reports
                  </button>
                )}
              </>
            )}
            
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-red-300 border-t border-white/10 mt-2 pt-4"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import FormField from "../../components/FormField";
import ToastStack from "../../components/ToastStack";
import { createTenant, createUser, getTenants, getUsers } from "../../services/api";

function sortData(items, config) {
  const sorted = [...items];
  sorted.sort((a, b) => {
    const aVal = (a?.[config.key] ?? "").toString().toLowerCase();
    const bVal = (b?.[config.key] ?? "").toString().toLowerCase();
    if (aVal < bVal) return config.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return config.direction === "asc" ? 1 : -1;
    return 0;
  });
  return sorted;
}

function StatPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SortableHeader({ label, column, entity, sortConfig, onSort }) {
  const active = sortConfig[entity].key === column;
  const direction = active ? sortConfig[entity].direction : "asc";
  return (
    <button
      type="button"
      onClick={() => onSort(entity, column)}
      className={`flex items-center gap-2 text-left text-xs font-semibold uppercase tracking-wide ${
        active ? "text-purple-200" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
      <span className="text-[10px]">{direction === "asc" ? "▲" : "▼"}</span>
    </button>
  );
}

export default function AdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rep");
  const [tenantCode, setTenantCode] = useState("");

  const [errors, setErrors] = useState({});
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [tenantSearch, setTenantSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    tenants: { key: "name", direction: "asc" },
    users: { key: "full_name", direction: "asc" },
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadTenants();
    loadUsers();
  }, []);

  const pushToast = (type, title, message) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const loadTenants = async () => {
    setLoadingTenants(true);
    try {
      const res = await getTenants();
      const companyTenants = res.filter((t) => t.code !== "master");
      setTenants(companyTenants);
    } catch (err) {
      console.error("Failed to load tenants:", err);
      pushToast("error", "Unable to load tenants", "Please check the backend connection and retry.");
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getUsers();
      setUsers(res);
    } catch (err) {
      console.error("Failed to load users:", err);
      pushToast("error", "Unable to load users", "Make sure the service is reachable.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const toggleSort = (entity, column) => {
    setSortConfig((prev) => {
      const current = prev[entity];
      const nextDirection = current.key === column && current.direction === "asc" ? "desc" : "asc";
      return { ...prev, [entity]: { key: column, direction: nextDirection } };
    });
  };

  const filteredTenants = useMemo(() => {
    const search = tenantSearch.toLowerCase();
    return tenants.filter((tenant) =>
      [tenant.name, tenant.code].some((value) => value?.toLowerCase().includes(search))
    );
  }, [tenantSearch, tenants]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.toLowerCase();
    return users
      .filter((user) => {
        if (userRoleFilter !== "all" && user.role !== userRoleFilter) return false;
        return [user.full_name, user.email, user.tenant_code]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(search));
      })
      .map((user) => ({ ...user, roleLabel: user.role === "manager" ? "Manager" : "Sales Rep" }));
  }, [userRoleFilter, userSearch, users]);

  const sortedTenants = useMemo(
    () => sortData(filteredTenants, sortConfig.tenants),
    [filteredTenants, sortConfig.tenants]
  );

  const sortedUsers = useMemo(() => sortData(filteredUsers, sortConfig.users), [filteredUsers, sortConfig.users]);

  const validateTenantForm = () => {
    const nextErrors = {};
    if (!companyName.trim()) nextErrors.companyName = "Company name is required.";
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateUserForm = () => {
    const nextErrors = {};
    if (!tenantCode) nextErrors.tenantCode = "Select a company before creating a user.";
    if (!password) nextErrors.password = "A secure password is required.";
    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    if (!validateTenantForm()) return;

    setCreatingTenant(true);
    try {
      await createTenant({
        name: companyName,
        code: companyName.toLowerCase().replace(/\s+/g, "_"),
      });
      setCompanyName("");
      pushToast("success", "Tenant created", `${companyName} is now available for user assignment.`);
      loadTenants();
    } catch (err) {
      console.error("Failed to create tenant:", err);
      pushToast(
        "error",
        "Tenant creation failed",
        err?.response?.data?.detail || "Please verify the name is unique and try again."
      );
    } finally {
      setCreatingTenant(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setCreatingUser(true);
    try {
      await createUser({
        full_name: fullName,
        email,
        password,
        role,
        tenant_code: tenantCode,
      });

      setFullName("");
      setEmail("");
      setPassword("");
      setTenantCode("");
      setErrors((prev) => ({ ...prev, tenantCode: "", password: "" }));
      pushToast("success", "User created", `${fullName || email} added to ${tenantCode}.`);
      loadUsers();
    } catch (err) {
      console.error("Failed to create user:", err);
      pushToast(
        "error",
        "User creation failed",
        err?.response?.data?.detail || "Please confirm the email is unique and try again."
      );
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <DashboardLayout
      title="Super Admin Dashboard"
      subtitle="Manage tenants, users, and permissions with guided forms and quick filters."
    >
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatPill label="Companies" value={tenants.length} />
        <StatPill label="Users" value={users.length} />
        <StatPill label="Managers" value={users.filter((u) => u.role === "manager").length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6" id="tenants">
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Tenant setup</p>
              <h2 className="text-xl font-semibold text-white">Create new company</h2>
            </div>
          </div>

          <form onSubmit={handleCreateTenant} className="space-y-4">
            <FormField
              label="Company name"
              helperText="We will automatically create a tenant code based on this name."
              required
              error={errors.companyName}
            >
              <input
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                placeholder="e.g. Acme Corp"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  setErrors((prev) => ({ ...prev, companyName: "" }));
                }}
                disabled={creatingTenant}
              />
            </FormField>

            <button
              type="submit"
              disabled={creatingTenant}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingTenant ? "Creating..." : "Create company"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-xl shadow-black/40 p-5" id="users">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-300">User onboarding</p>
              <h2 className="text-xl font-semibold text-white">Invite a teammate</h2>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Full name" helperText="How this user will appear in the CRM.">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={creatingUser}
                />
              </FormField>
              <FormField label="Email" helperText="Login email for this user.">
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                  placeholder="jane@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={creatingUser}
                />
              </FormField>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Password"
                helperText="Set an initial password; users should change it after first login."
                required
                error={errors.password}
              >
                <input
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                  placeholder="Secure password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  disabled={creatingUser}
                />
              </FormField>
              <FormField label="Role" helperText="Choose permissions for this teammate.">
              <select
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={creatingUser}
              >
                  <option value="rep">Sales Rep</option>
                  <option value="manager">Manager</option>
                </select>
              </FormField>
            </div>

            <FormField
              label="Assign to company"
              helperText="Users must belong to a tenant to access its CRM."
              required
              error={errors.tenantCode}
            >
              <select
                className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 disabled:opacity-60"
                value={tenantCode}
                onChange={(e) => {
                  setTenantCode(e.target.value);
                  setErrors((prev) => ({ ...prev, tenantCode: "" }));
                }}
                disabled={creatingUser || loadingTenants}
              >
                <option value="">Select company</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.code}>
                    {t.name}
                  </option>
                ))}
              </select>
            </FormField>

            <button
              type="submit"
              disabled={creatingUser}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition hover:from-purple-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingUser ? "Creating user..." : "Create user"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/40 p-5" id="tenants-list">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Companies</p>
              <h3 className="text-lg font-semibold text-white">Tenant directory</h3>
            </div>
            <input
              className="w-full sm:w-64 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
              placeholder="Filter by name or code"
              value={tenantSearch}
              onChange={(e) => setTenantSearch(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="px-4 py-3"><SortableHeader label="Company" column="name" entity="tenants" sortConfig={sortConfig} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortableHeader label="Code" column="code" entity="tenants" sortConfig={sortConfig} onSort={toggleSort} /></th>
                </tr>
              </thead>
              <tbody>
                {loadingTenants && (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={3}>Loading tenants...</td>
                  </tr>
                )}
                {!loadingTenants && sortedTenants.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={3}>No tenants found.</td>
                  </tr>
                )}
                {!loadingTenants &&
                  sortedTenants.map((tenant) => (
                    <tr key={tenant.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-white">{tenant.name}</td>
                      <td className="px-4 py-3 text-slate-300">{tenant.code}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 shadow-xl shadow-black/40 p-5" id="users-list">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-300">Team</p>
              <h3 className="text-lg font-semibold text-white">User directory</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <select
                className="rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All roles</option>
                <option value="manager">Managers</option>
                <option value="rep">Sales reps</option>
              </select>
              <input
                className="rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 sm:w-64"
                placeholder="Search name, email, tenant"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="px-4 py-3"><SortableHeader label="Name" column="full_name" entity="users" sortConfig={sortConfig} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortableHeader label="Role" column="role" entity="users" sortConfig={sortConfig} onSort={toggleSort} /></th>
                  <th className="px-4 py-3"><SortableHeader label="Tenant" column="tenant_code" entity="users" sortConfig={sortConfig} onSort={toggleSort} /></th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers && (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={4}>Loading users...</td>
                  </tr>
                )}
                {!loadingUsers && sortedUsers.length === 0 && (
                  <tr>
                    <td className="px-4 py-4 text-slate-400" colSpan={4}>No users found.</td>
                  </tr>
                )}
                {!loadingUsers &&
                  sortedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{user.full_name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.role === "manager"
                            ? "bg-amber-500/10 text-amber-200 border border-amber-300/40"
                            : "bg-emerald-500/10 text-emerald-200 border border-emerald-300/40"
                        }`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {user.roleLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{user.tenant_code || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}

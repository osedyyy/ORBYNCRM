import { useState, useEffect } from "react";
import api, { createUser, createTenant, getTenants, getUsers } from "../../services/api";
  


export default function AdminDashboard() {
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);

  const [companyName, setCompanyName] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("rep");
  const [tenantCode, setTenantCode] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // --------------------------------------------------
  // LOAD TENANTS AND USERS ON PAGE LOAD
  // --------------------------------------------------
  useEffect(() => {
    loadTenants();
    loadUsers();
  }, []);

  const loadTenants = async () => {
    try {
      const res = await api.get("/tenants");
      // Filter out the master tenant, only show company tenants
      const companyTenants = res.data.filter(t => t.code !== "master");
      setTenants(companyTenants);
    } catch (err) {
      console.error("Failed to load tenants:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  // --------------------------------------------------
  // CREATE NEW TENANT / COMPANY
  // --------------------------------------------------
  const handleCreateTenant = async () => {
    try {
      await createTenant({
        name: companyName,
        code: companyName.toLowerCase().replace(/ /g, "_"),
      });
      setCompanyName("");
      loadTenants();
    } catch (err) {
      console.error("Failed to create tenant:", err);
    }
  };

  // --------------------------------------------------
  // CREATE NEW USER
  // --------------------------------------------------
  const handleCreateUser = async () => {
    if (!tenantCode) {
      alert("Please select a company for this user.");
      return;
    }

    try {
      console.log("Sending USER:", {
        full_name: fullName,
        email,
        password,
        role,
        tenant_code: tenantCode,   // <- IMPORTANT!!!
      });

      await createUser({
        full_name: fullName,
        email,
        password,
        role,
        tenant_code: tenantCode,
      });

      setSuccessMessage("User created successfully!");
      setFullName("");
      setEmail("");
      setPassword("");
      setTenantCode("");

      loadUsers();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-6">Super Admin Dashboard</h1>

      {/* -------------------------------------------------- */}
      {/* CREATE COMPANY */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl mb-3">Create New Company (Tenant)</h2>
      <input
        placeholder="Company Name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
      />
      <button onClick={handleCreateTenant}>Add</button>

      {/* -------------------------------------------------- */}
      {/* CREATE USER */}
      {/* -------------------------------------------------- */}
      <h2 className="text-2xl mt-10 mb-3">Create User</h2>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="rep">Sales Rep</option>
        <option value="manager">Manager</option>
      </select>

      <select value={tenantCode} onChange={(e) => setTenantCode(e.target.value)}>
        <option value="">Select Company</option>
        {tenants.map((t) => (
          <option key={t.id} value={t.code}>
            {t.name}
          </option>
        ))}
      </select>

      <button onClick={handleCreateUser}>Create User</button>
    </div>
  );
}

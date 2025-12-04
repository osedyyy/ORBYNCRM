import { useState, useEffect } from "react";
import { createUser, getTenants } from "../../services/api";

export default function CreateUser() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
    tenant_code: "",
  });

  const [tenants, setTenants] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenantList = await getTenants();
        setTenants(tenantList);
      } catch (err) {
        console.error("Failed to fetch tenants:", err);
      }
    };
    fetchTenants();
  }, []);

  const handleSubmit = async () => {
    try {
      await createUser(form);
      setMessage("User created successfully!");
    } catch (err) {
      setMessage("Failed to create user.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create New User</h1>

      <input
        className="border p-2 w-full mb-2"
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-2"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="border p-2 w-full mb-2"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select
        className="border p-2 w-full mb-2"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      <select
        className="border p-2 w-full mb-2"
        value={form.tenant_code}
        onChange={(e) => setForm({ ...form, tenant_code: e.target.value })}
      >
        <option value="">Please select a company for this user</option>
        {tenants.map((tenant) => (
          <option key={tenant.code} value={tenant.code}>
            {tenant.name}
          </option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create User
      </button>

      {message && <p className="mt-3 text-green-500">{message}</p>}
    </div>
  );
}

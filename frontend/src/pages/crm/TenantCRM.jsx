import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers, addCustomer } from "../../services/api";

export default function TenantCRM() {
  const tenant = JSON.parse(localStorage.getItem("tenant"));
  const tenantCode = tenant?.code || "";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    address: "",
    tenant_code: tenantCode ?? "",
  });

  useEffect(() => {
    if (!tenantCode) {
      navigate("/login", { replace: true });
      return;
    }

    loadCustomers();
  }, [tenantCode]);

  const loadCustomers = async () => {
    setError("");
    if (!tenantCode) {
      setError("Tenant code missing. Please reselect a tenant.");
      setCustomers([]);
      return;
    }

    try {
      setLoading(true);
      const data = await getCustomers(tenantCode);
      setCustomers(data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!tenantCode) {
      setError("Cannot add customer without a tenant code.");
      return;
    }

    try {
      await addCustomer({ ...form, tenant_code: tenantCode });
      setForm({
        name: "",
        email: "",
        phone: "",
        company_name: "",
        address: "",
        tenant_code: tenantCode,
      });
      loadCustomers();
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to add customer.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-4">
        {tenant?.name} CRM
      </h1>

      {error && (
        <div className="bg-red-900/40 text-red-100 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Customer */}
      <div className="bg-[#111] p-5 rounded-xl mb-10">
        <h2 className="text-xl font-semibold mb-3">Add Customer</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Name" value={form.name} onChange={handleChange("name")} />
          <input className="input" placeholder="Email" value={form.email} onChange={handleChange("email")} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={handleChange("phone")} />
          <input className="input" placeholder="Company" value={form.company_name} onChange={handleChange("company_name")} />
          <input className="input" placeholder="Address" value={form.address} onChange={handleChange("address")} />

          <button className="bg-purple-600 px-4 py-2 rounded col-span-2">Add Customer</button>
        </form>
      </div>

      {/* Customer List */}
      <div className="bg-[#111] p-5 rounded-xl">
        <h2 className="text-xl font-semibold mb-3">Customer List</h2>

        {loading ? (
          <p className="opacity-70 py-4">Loading customers...</p>
        ) : (
          <table className="w-full">
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.company_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && customers.length === 0 && (
          <p className="text-center opacity-50 py-6">No customers yet.</p>
        )}
      </div>
    </div>
  );
}

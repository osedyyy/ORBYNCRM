import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantCode, setTenantCode] = useState(""); // frontend state
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      // Package EXACTLY what backend expects
      const payload = {
        email,
        password,
        tenant_code: tenantCode, // 🔥 FIXED KEY
      };

      console.log("LOGIN SENDING:", payload);

      // Call backend
      const result = await loginUser(payload);

      console.log("LOGIN RESPONSE:", result);

      // Save session
      localStorage.setItem("user_id", result.user.id);
      localStorage.setItem("role", result.user.role);
      localStorage.setItem("user_email", result.user.email);
      localStorage.setItem("tenant", JSON.stringify(result.tenant));
      localStorage.setItem("tenant_code", result.tenant.code ?? "master");
      localStorage.setItem("tenant_name", result.tenant.name);

      // Redirect
      if (result.user.role === "superadmin") {
        navigate("/admin");
      } else {
        navigate("/crm");
      }

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Invalid login. Check email, password, or company.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="p-8 rounded-xl shadow-xl bg-[#111] w-[380px]">
        <h1 className="text-3xl font-bold text-center mb-6">
          Multi-Tenant CRM Login
        </h1>

        {/* EMAIL */}
        <label className="block mb-2 font-semibold">Email</label>
        <input
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 mb-4"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD */}
        <label className="block mb-2 font-semibold">Password</label>
        <input
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 mb-4"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* TENANT */}
        <label className="block mb-2 font-semibold">Select Company</label>
        <select
          className="w-full p-2 rounded bg-gray-900 border border-gray-700 mb-6"
          value={tenantCode}
          onChange={(e) => setTenantCode(e.target.value)}
        >
          <option value="">Choose one</option>
          <option value="master">Master Admin</option>
          <option value="home_depot">Home Depot</option>
          <option value="walmart">Walmart</option>
          <option value="target">Target</option>
        </select>

        {error && <p className="text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleLogin}
          className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700 transition"
        >
          Log In
        </button>
      </div>
    </div>
  );
}

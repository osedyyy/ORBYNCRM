import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TenantCRM from "./pages/crm/TenantCRM";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route path="/" element={<Login />} />

        {/* SUPER ADMIN DASHBOARD */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* TENANT CRM DASHBOARD */}
        <Route path="/crm" element={<TenantCRM />} />

      </Routes>
    </BrowserRouter>
  );
}

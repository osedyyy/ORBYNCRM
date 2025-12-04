import { useState } from "react";
import { createTenant } from "../../services/api";

export default function CreateTenant() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    try {
      await createTenant({ name });
      setMessage("Tenant created successfully!");
    } catch (err) {
      setMessage("Failed to create tenant.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Create Company / Tenant</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        Create Tenant
      </button>

      {message && <p className="mt-3 text-green-500">{message}</p>}
    </div>
  );
}

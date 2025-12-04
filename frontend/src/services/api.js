import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});


// =====================
// AUTH
// =====================

export async function loginUser(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}


// =====================
// CUSTOMERS
// =====================

export async function getCustomers() {
  const res = await api.get("/customers");
  return res.data;
}

export async function addCustomer(body) {
  const res = await api.post("/customers", body);
  return res.data;
}

// =====================
// TENANTS
// =====================

export async function getTenants() {
  const res = await api.get("/tenants");
  return res.data;
}

export async function createTenant(body) {
  const res = await api.post("/tenants", body);
  return res.data;
}

// =====================
// USERS
// =====================

export async function getUsers() {
  const userId = localStorage.getItem("user_id");

  const res = await api.get("/users", {
    headers: {
      "user_id": userId
    }
  });

  return res.data;
}

export async function createUser(body) {
  const userId = localStorage.getItem("user_id");

  const res = await api.post("/users", body, {
    headers: {
      "user_id": userId
    }
  });

  return res.data;
}

export default api;

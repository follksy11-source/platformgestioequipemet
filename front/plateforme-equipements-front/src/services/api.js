const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Erreur ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const authApi = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
};

export const equipementsApi = {
  getAll: () => request("/equipements"),
  getById: (id) => request(`/equipements/${id}`),
  create: (data) =>
    request("/equipements", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/equipements/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/equipements/${id}`, { method: "DELETE" }),
};

export const laboratoiresApi = {
  getAll: () => request("/laboratoires"),
  getById: (id) => request(`/laboratoires/${id}`),
  create: (data) => request("/laboratoires", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/laboratoires/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/laboratoires/${id}`, { method: "DELETE" }),
  valider: (id) => request(`/laboratoires/${id}/valider`, { method: "PATCH" }),
};

export const demandesApi = {
  getAll: () => request("/demandes"),
  getById: (id) => request(`/demandes/${id}`),
  create: (data) => request("/demandes", { method: "POST", body: JSON.stringify(data) }),
  valider: (id) => request(`/demandes/${id}/valider`, { method: "PATCH" }),
  refuser: (id) => request(`/demandes/${id}/refuser`, { method: "PATCH" }),
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");


export function mediaUrl(path) {
  if (!path) return null;

  // Le média possède déjà une URL complète
  if (/^https?:\/\//i.test(path)) return path;

  // Le média est stocké sous forme de chemin relatif
  return `${API_ORIGIN}/${path.replace(/^\/+/, "")}`;
}

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

async function requestFormData(path, formData, method = "POST") {
  const token = getToken();

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    body: formData,
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
  getDisponibilites: (id) =>
    request(`/equipements/${id}/disponibilites`).then((d) => d.data),
  mesEquipements: () =>
    request("/equipements/mes-equipements").then((d) => d.data),
  create: (data) =>
    request("/equipements", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/equipements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) => request(`/equipements/${id}`, { method: "DELETE" }),
};

export const laboratoiresApi = {
  getAll: () => request("/laboratoires"),
  getById: (id) => request(`/laboratoires/${id}`),
  create: (data) =>
    request("/laboratoires", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/laboratoires/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) => request(`/laboratoires/${id}`, { method: "DELETE" }),
  valider: (id) => request(`/laboratoires/${id}/valider`, { method: "PATCH" }),
};

export const demandesApi = {
  getAll: () => request("/demandes"),
  getById: (id) => request(`/demandes/${id}`),
  create: (data) =>
    request("/demandes", { method: "POST", body: JSON.stringify(data) }),
  valider: (id) => request(`/demandes/${id}/valider`, { method: "PATCH" }),
  refuser: (id) => request(`/demandes/${id}/refuser`, { method: "PATCH" }),
};

export const reservationsApi = {
  create: (data) =>
    request("/reservations", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  mesReservations: async () => {
    const data = await request("/reservations/mes-reservations");
    return data.reservations;
  },

  gestion: async () => {
    const data = await request("/reservations/gestion");
    return data.reservations;
  },

  getById: (id) => request(`/reservations/${id}`),

  accepter: (id) =>
    request(`/reservations/${id}/accepter`, {
      method: "PATCH",
    }),

  refuser: (id) =>
    request(`/reservations/${id}/refuser`, {
      method: "PATCH",
    }),

  annuler: (id) =>
    request(`/reservations/${id}/annuler`, {
      method: "PATCH",
    }),
};

export const messagesApi = {
  send: (data) =>
    request("/messages", { method: "POST", body: JSON.stringify(data) }),
  recus: () => request("/messages/recus"),
  envoyes: () => request("/messages/envoyes"),
  getById: (id) => request(`/messages/${id}`),
  marquerLu: (id) => request(`/messages/${id}/lu`, { method: "PATCH" }),
};

export const commentairesApi = {
  getByEquipement: (equipementId) =>
    request(`/commentaires/equipement/${equipementId}`).then(
      (d) => d.commentaires,
    ),
  create: (data) =>
    request("/commentaires", { method: "POST", body: JSON.stringify(data) }),
  mesCommentaires: () =>
    request("/commentaires/mes-commentaires").then((d) => d.commentaires),
  admin: () => request("/commentaires/admin").then((d) => d.commentaires),
  valider: (id) => request(`/commentaires/${id}/valider`, { method: "PATCH" }),
  refuser: (id) => request(`/commentaires/${id}/refuser`, { method: "PATCH" }),
};

export const rapportsApi = {
  getByEquipement: (equipementId) =>
    request(`/rapports/equipement/${equipementId}`).then((d) => d.rapports),
  create: (data) =>
    request("/rapports", { method: "POST", body: JSON.stringify(data) }),
  mesRapports: () => request("/rapports/mes-rapports").then((d) => d.rapports),
  admin: () => request("/rapports/admin").then((d) => d.rapports),
  valider: (id) => request(`/rapports/${id}/valider`, { method: "PATCH" }),
  refuser: (id) => request(`/rapports/${id}/refuser`, { method: "PATCH" }),
};

export const travauxApi = {
  getAll: () => request("/travaux-recherche").then((d) => d.travaux),
  getById: (id) => request(`/travaux-recherche/${id}`).then((d) => d.travail),
  getByEquipement: (equipementId) =>
    request(`/travaux-recherche/equipement/${equipementId}`).then(
      (d) => d.travaux,
    ),
  mesTravaux: () =>
    request("/travaux-recherche/mes-travaux").then((d) => d.travaux),
  create: (data) =>
    request("/travaux-recherche", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/travaux-recherche/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) => request(`/travaux-recherche/${id}`, { method: "DELETE" }),
};

export const utilisateursApi = {
  getAll: () => request("/utilisateurs").then((d) => d.utilisateurs),
  getById: (id) => request(`/utilisateurs/${id}`),
  update: (id, data) =>
    request(`/utilisateurs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  valider: (id) => request(`/utilisateurs/${id}/valider`, { method: "PATCH" }),
  refuser: (id) => request(`/utilisateurs/${id}/refuser`, { method: "PATCH" }),
  changerRole: (id, role) =>
    request(`/utilisateurs/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),
  remove: (id) => request(`/utilisateurs/${id}`, { method: "DELETE" }),
};

export const publicationsApi = {
  getAll: () =>
    request("/publications").then((d) => d.publications),

  getById: (id) =>
    request(`/publications/${id}`).then((d) => d.publication),

  admin: () =>
    request("/publications/admin").then((d) => d.publications),

  // Création avec image facultative
  create: (data) => {
    if (data instanceof FormData) {
      return requestFormData("/publications", data);
    }

    // Compatibilité avec la création sans image
    return request("/publications", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Modification avec ou sans nouvelle image
  update: (id, data) => {
    if (data instanceof FormData) {
      return requestFormData(`/publications/${id}`, data, "PUT");
    }

    return request(`/publications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  publier: (id) =>
    request(`/publications/${id}/publier`, { method: "PATCH" }),

  depublier: (id) =>
    request(`/publications/${id}/depublier`, { method: "PATCH" }),

  remove: (id) =>
    request(`/publications/${id}`, { method: "DELETE" }),
};



export const institutionsApi = {
  getAll: () => request("/institutions").then((d) => d.data),
};

async function uploadRequest(path, file, method = "POST") {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Erreur ${res.status}`);
  }
  return res.json();
}

export const uploadsApi = {
  uploadPhoto: (resource, id, file) =>
    uploadRequest(`/uploads/${resource}/${id}/photo`, file),
  deletePhoto: (resource, id) =>
    request(`/uploads/${resource}/${id}/photo`, { method: "DELETE" }),
  uploadModele3D: (resource, id, file) =>
    uploadRequest(`/uploads/${resource}/${id}/modele-3d`, file),
  deleteModele3D: (resource, id) =>
    request(`/uploads/${resource}/${id}/modele-3d`, { method: "DELETE" }),
};

export const factsApi = {
  getAll: () => request("/facts").then((d) => d.facts),
  getById: (id) => request(`/facts/${id}`).then((d) => d.fact),
  adminAll: () => request("/facts/admin/all").then((d) => d.facts),
  getCategories: () => request("/facts/categories").then((d) => d.categories),
  create: (data) => request("/facts", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/facts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  publier: (id) => request(`/facts/${id}/publier`, { method: "PATCH" }),
  archiver: (id) => request(`/facts/${id}/archiver`, { method: "PATCH" }),
  remove: (id) => request(`/facts/${id}`, { method: "DELETE" }),
};

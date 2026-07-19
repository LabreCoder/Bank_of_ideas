import { api } from "./api";

export const ownersApi = {
  list: () => api.get("/owner/owners"),
  create: (payload) => api.post("/owner/", payload),
  update: (id, payload) => api.put(`/owner/${id}`, payload),
  delete: (id) => api.delete(`/owner/${id}`),
};
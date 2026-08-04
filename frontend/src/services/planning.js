import { api } from "./api";

export const planningApi = {
  list: () => api.get("/planning/plannings"),
  get: (id) => api.get(`/planning/${id}`),
  create: (payload) => api.post("/planning/", payload),
  update: (id, payload) => api.put(`/planning/${id}`, payload),
  delete: (id) => api.delete(`/planning/${id}`),

};
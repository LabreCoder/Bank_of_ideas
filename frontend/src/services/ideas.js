import { api } from "./api";

export const ideasApi = {
  list: () => api.get("/ideas/list/"),
  get: (id) => api.get(`/ideas/${id}`),
  create: (payload) => api.post("/ideas/", payload),
  update: (id, payload) => api.put(`/ideas/${id}`, payload),
  toggleActive: (id) => api.patch(`/ideas/${id}/toggle-active`),
};
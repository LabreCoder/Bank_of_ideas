import { api } from "./api";

export const planningApi = {
  list: () => api.get("/planning/plannings"),
  get: (id) => api.get(`/planning/${id}`),
  create: (payload) => api.post("/planning/", payload),
  update: (id, payload) => api.put(`/planning/${id}`, payload),
  delete: (id) => api.delete(`/planning/${id}`),

  addChecklistItem: (planningId, description) =>
    api.post(`/planning/${planningId}/checklist`, { description }),
  toggleChecklistItem: (planningId, itemId) =>
    api.patch(`/planning/${planningId}/checklist/${itemId}/toggle`),
  deleteChecklistItem: (planningId, itemId) =>
    api.delete(`/planning/${planningId}/checklist/${itemId}`),
};
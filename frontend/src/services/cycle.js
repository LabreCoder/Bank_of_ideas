import { api } from "./api";

export const cycleApi = {
  list: () => api.get("/cycle/"),
  getById: (id) => api.get(`/cycle/${id}`),
  create: (data) => api.post("/cycle/", data),
  update: (id, data) => api.put(`/cycle/${id}`, data),
  updateDueDate: (id, due_date, force = false) =>
    api.patch(`/cycle/${id}/due-date`, { due_date, force }),
  bindPlanning: (cycleId, planningId, confirmCandidateDueDate = false) =>
    api.post(`/cycle/${cycleId}/bind`, {
      planning_id: Number(planningId),
      confirm_candidate_due_date: confirmCandidateDueDate,
    }),
  unbindPlanning: (cycleId, planningId) =>
    api.delete(`/cycle/${cycleId}/unbind/${planningId}`),
  delete: (id) => api.delete(`/cycle/${id}`),
};
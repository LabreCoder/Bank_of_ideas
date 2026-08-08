import { api } from "./api";

export const cycleApi = {
  list: () => api.get("/cycle/"),
  getById: (id) => api.get(`/cycle/${id}`),
  create: (data) => api.post("/cycle/", data),
  update: (id, data) => api.put(`/cycle/${id}`, data),

  // force foi removido: um conflito de data agora sempre bloqueia o
  // update. A resolução é manual — editar a due_date do planning
  // conflitante, ou escolher outra due_date para o cycle.
  updateDueDate: (id, due_date) => api.patch(`/cycle/${id}/due-date`, { due_date }),

  bindPlanning: (cycleId, planningId, confirmCandidateDueDate = false) =>
    api.post(`/cycle/${cycleId}/bind`, {
      planning_id: Number(planningId),
      confirm_candidate_due_date: confirmCandidateDueDate,
    }),
  unbindPlanning: (cycleId, planningId) =>
    api.delete(`/cycle/${cycleId}/unbind/${planningId}`),
  delete: (id) => api.delete(`/cycle/${id}`),
};
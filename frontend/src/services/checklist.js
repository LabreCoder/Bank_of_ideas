import { api } from "./api";

export const checklistApi = {
  // Aceita payload objeto ex: { description, due_date } ou mantemos retrocompatível
  addChecklistItem: (planningId, payload) => {
    const body = typeof payload === "string" ? { description: payload } : payload;
    return api.post(`/planning/${planningId}/checklist`, body);
  },
  toggleChecklistItem: (planningId, itemId) =>
    api.patch(`/planning/${planningId}/checklist/${itemId}/toggle`),
  updateChecklistItem: (planningId, itemId, payload) => {
    const body = typeof payload === "string" ? { description: payload } : payload;
    return api.put(`/planning/${planningId}/checklist/${itemId}`, body);
  },
  deleteChecklistItem: (planningId, itemId) =>
    api.delete(`/planning/${planningId}/checklist/${itemId}`),
};
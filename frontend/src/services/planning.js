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
  /*updateChecklistItem: (planningId, itemId, description) =>
    api.put(`/planning/${planningId}/checklist/${itemId}`, { description }),*/
  updateChecklistItem: async (planningId, itemId, descriptionText) => {
  const response = await fetch(`/api/plannings/${planningId}/checklist/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    // Envia o texto entre aspas no JSON, ex: "Finish the basic course."
    body: JSON.stringify(descriptionText), 
  });
  return response.json();
},
  deleteChecklistItem: (planningId, itemId) =>
    api.delete(`/planning/${planningId}/checklist/${itemId}`),
};
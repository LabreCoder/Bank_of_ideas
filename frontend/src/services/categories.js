import { api } from "./api";

export const categoriesApi = {
  list: () => api.get("/category/"),
  create: (payload) => api.post("/category/", payload),
  update: (id, payload) => api.put(`/category/${id}`, payload),
  delete: (id) => api.delete(`/category/${id}`),
};
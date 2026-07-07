import { api } from "./api";

export const categoriesApi = {
  list: () => api.get("/category/"),
};
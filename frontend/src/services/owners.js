import { api } from "./api";

export const ownersApi = {
  list: () => api.get("/owner/owners"),
};
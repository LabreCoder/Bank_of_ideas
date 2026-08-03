import { useState } from "react";

export const DEFAULT_FILTERS = {
  name: "",
  categoryId: "",
  ownerId: "",
  status: "",
  active: "",
};

export function useIdeaFilters(initialValues = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState(initialValues);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return { filters, setFilters, resetFilters };
}   
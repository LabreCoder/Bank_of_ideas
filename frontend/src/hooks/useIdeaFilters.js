import { useCallback, useState } from "react";

const DEFAULT_FILTERS = {
  name: "",
  categoryId: "",
  ownerId: "",
  active: "",
};

export function useIdeaFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return { filters, setFilters, resetFilters };
}
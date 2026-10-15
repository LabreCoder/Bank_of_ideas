import { useCallback, useState } from "react";
import { DEFAULT_CYCLE_FILTERS } from "../utils/cycleFilters";

export function useCycleFilters() {
  const [filters, setFilters] = useState(DEFAULT_CYCLE_FILTERS);

  const updateFilter = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Limpar mantém a aba (status) selecionada.
  const resetFilters = useCallback(
    () => setFilters((prev) => ({ ...DEFAULT_CYCLE_FILTERS, statuses: prev.statuses })),
    []
  );

  return { filters, updateFilter, resetFilters };
}

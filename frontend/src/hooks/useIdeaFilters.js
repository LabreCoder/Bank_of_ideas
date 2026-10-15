import { useCallback, useRef, useState } from "react";
import { DEFAULT_IDEA_FILTERS, countActiveIdeaFilters } from "../utils/ideaFilters";

// `initial` sobrescreve o padrão da página (ex.: Ideas começa com { active: "true" }).
// Limpar os filtros volta a esse padrão, não ao padrão global.
export function useIdeaFilters(initial = {}) {
  const defaultsRef = useRef({ ...DEFAULT_IDEA_FILTERS, ...initial });
  const [filters, setFilters] = useState(defaultsRef.current);

  const updateFilter = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultsRef.current), []);

  const activeCount = countActiveIdeaFilters(filters, defaultsRef.current);

  return { filters, setFilters, updateFilter, resetFilters, activeCount };
}
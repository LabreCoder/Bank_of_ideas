// Lógica de filtro compartilhada por Ideas e Planning. Em Planning o filtro
// é aplicado sobre `planning.idea`, que expõe os mesmos campos (name,
// category, owner, is_active).

export const DEFAULT_IDEA_FILTERS = {
  name: "",
  categoryId: "",
  ownerId: "",
  active: "true", // "true" = só ativas (toggle "Show inactive" desligado) | "" = todas
};

export function matchesIdeaFilters(idea, filters) {
  const name = filters.name.trim().toLowerCase();
  if (name && !idea.name?.toLowerCase().includes(name)) return false;
  if (filters.categoryId && idea.category?.id !== Number(filters.categoryId)) return false;
  if (filters.ownerId && idea.owner?.id !== Number(filters.ownerId)) return false;
  if (filters.active === "true" && !idea.is_active) return false;
  return true;
}

// Conta quantos filtros diferem do padrão (só ativas, sem busca/categoria/responsável).
export function countActiveIdeaFilters(filters, defaults = DEFAULT_IDEA_FILTERS) {
  return Object.keys(DEFAULT_IDEA_FILTERS).filter((key) => {
    const value = typeof filters[key] === "string" ? filters[key].trim() : filters[key];
    return value !== defaults[key];
  }).length;
}

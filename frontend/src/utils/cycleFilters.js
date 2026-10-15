// Lógica pura de filtro/ordenação da página de Cycles.
//
// Datas chegam como "YYYY-MM-DD". Comparações são feitas por string (ordem
// lexicográfica == ordem cronológica nesse formato), evitando `new Date(str)`
// que interpreta como UTC e pode deslocar um dia no Brasil (UTC-3).

export const CYCLE_STATUSES = ["Waiting Start", "In Progress", "Finished"];

export const DEADLINE_OPTIONS = [
  { value: "", label: "Any deadline" },
  { value: "overdue", label: "Overdue" },
  { value: "next7", label: "Next 7 days" },
  { value: "next30", label: "Next 30 days" },
  { value: "noDeadline", label: "No deadline" },
];

export const SORT_OPTIONS = [
  { value: "start_date", label: "Start date" },
  { value: "due_date", label: "Due date" },
  { value: "name", label: "Name" },
  { value: "progress", label: "Progress" },
];

export const DEFAULT_CYCLE_FILTERS = {
  search: "",
  statuses: [],
  deadline: "",
  rangeFrom: "",
  rangeTo: "",
  ideaQuery: "",
  sortBy: "start_date",
  sortDir: "asc",
};

function normalize(text) {
  return (text || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayIso(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return toIsoDate(date);
}

function matchesDeadline(cycle, deadline) {
  if (!deadline) return true;
  if (deadline === "noDeadline") return !cycle.due_date;

  // Demais presets só fazem sentido para cycles ainda em aberto.
  if (!cycle.due_date || cycle.status === "Finished") return false;

  const today = todayIso();
  if (deadline === "overdue") return cycle.due_date < today;
  if (deadline === "next7") {
    return cycle.due_date >= today && cycle.due_date <= todayIso(7);
  }
  if (deadline === "next30") {
    return cycle.due_date >= today && cycle.due_date <= todayIso(30);
  }
  return true;
}

// Intersecção entre [start_date, due_date] do cycle e [rangeFrom, rangeTo].
// Cycle sem due_date é tratado como intervalo aberto à direita.
function matchesRange(cycle, rangeFrom, rangeTo) {
  if (rangeTo && cycle.start_date > rangeTo) return false;
  if (rangeFrom && cycle.due_date && cycle.due_date < rangeFrom) return false;
  return true;
}

function matchesIdea(cycle, ideaQuery) {
  const query = normalize(ideaQuery);
  if (!query) return true;
  return (cycle.plannings || []).some((p) =>
    normalize(p.idea?.name).includes(query)
  );
}

function compareBy(sortBy) {
  switch (sortBy) {
    case "name":
      return (a, b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" });
    case "progress":
      return (a, b) => a.progress_percentage - b.progress_percentage;
    case "due_date":
      // Sem prazo sempre por último, independente da direção (tratado em applyCycleFilters).
      return (a, b) => a.due_date.localeCompare(b.due_date);
    case "start_date":
    default:
      return (a, b) => a.start_date.localeCompare(b.start_date);
  }
}

export function applyCycleFilters(cycles, filters) {
  const search = normalize(filters.search);

  const filtered = cycles.filter((cycle) => {
    if (search) {
      const haystack = `${normalize(cycle.name)} ${normalize(cycle.description)}`;
      if (!haystack.includes(search)) return false;
    }
    if (filters.statuses.length > 0 && !filters.statuses.includes(cycle.status)) {
      return false;
    }
    return (
      matchesDeadline(cycle, filters.deadline) &&
      matchesRange(cycle, filters.rangeFrom, filters.rangeTo) &&
      matchesIdea(cycle, filters.ideaQuery)
    );
  });

  const direction = filters.sortDir === "desc" ? -1 : 1;
  const compare = compareBy(filters.sortBy);

  return [...filtered].sort((a, b) => {
    if (filters.sortBy === "due_date") {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
    }
    return compare(a, b) * direction;
  });
}

// Quantos filtros estão ativos (ordenação fora do padrão também conta).
// O status não entra: ele é escolhido pelas abas, como nas demais páginas.
export function countActiveFilters(filters) {
  let count = 0;
  if (filters.search.trim()) count += 1;
  if (filters.deadline) count += 1;
  if (filters.rangeFrom || filters.rangeTo) count += 1;
  if (filters.ideaQuery.trim()) count += 1;
  if (
    filters.sortBy !== DEFAULT_CYCLE_FILTERS.sortBy ||
    filters.sortDir !== DEFAULT_CYCLE_FILTERS.sortDir
  ) {
    count += 1;
  }
  return count;
}

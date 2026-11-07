// Centraliza o que antes estava duplicado em PlanningCard.jsx,
// PlanningDetailModal.jsx (removido) e DayIdeasModal.jsx. Fonte única dos status de planning
// (usada também pelas telas e painéis de Planning). Se um dia adicionar um novo
// status, muda só aqui.
export const PLANNING_STATUS_OPTIONS = [
  "Not Started",
  "Under Review",
  "Started",
  "In Development",
  "Completed",
  "Cancelled",
];

export const PLANNING_STATUS_STYLES = {
  "Not Started": "bg-ui-surface-2 text-ui-text-secondary border-ui-border",
  "Under Review": "bg-status-blue-bg text-status-blue-fg border-status-blue-border",
  "Started": "bg-status-purple-bg text-status-purple-fg border-status-purple-border",
  "In Development": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
  "Completed": "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
  "Cancelled": "bg-status-rose-bg text-status-rose-fg border-status-rose-border",
};
// Estilo usado quando um status não está mapeado (D07).
export const STATUS_FALLBACK_STYLE = "bg-ui-surface-2 text-ui-text-secondary border-ui-border";

// Status finais (espelha TERMINAL_PLANNING_STATUSES do backend).
export const TERMINAL_PLANNING_STATUSES = new Set(["Completed", "Cancelled"]);

// Estilos de status de ciclo — fonte única (antes duplicados em
// CycleDetailView e CycleTimelineCard).
export { STATUS_FALLBACK_STYLE } from "./planningStatus.js";

export const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-ui-surface-2 text-ui-text-secondary border-ui-border",
  "In Progress": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
  Finished: "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
};

// D09: indicador derivado `is_overdue` (data final passou e o ciclo não está
// "Finished"). Não é um 4º status — aparece ao lado do status.
export const CYCLE_OVERDUE_STYLE = "bg-status-red-bg text-status-red-fg border-status-red-border";
export const CYCLE_OVERDUE_LABEL = "Overdue";

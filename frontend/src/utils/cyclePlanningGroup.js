// Separado de utils/planningStatus.js de propósito: aquele arquivo mapeia
// os 6 status pras cores usadas nos cards/badges do Planning (uma cor por
// status). Aqui, a modal de Cycle agrupa os 6 em só 4 categorias visuais
// (Pendente / Em andamento / Concluído / Cancelado), como no mockup.

export const PLANNING_GROUPS = {
  pending: { label: "Pending", dotClass: "bg-gray-400" },
  in_progress: { label: "In Progress", dotClass: "bg-blue-500" },
  completed: { label: "Completed", dotClass: "bg-emerald-500" },
  cancelled: { label: "Cancelled", dotClass: "bg-rose-500" },
};

const STATUS_TO_GROUP = {
  "Not Started": "pending",
  "Under Review": "in_progress",
  "Started": "in_progress",
  "In Development": "in_progress",
  "Completed": "completed",
  "Cancelled": "cancelled",
};

export function getPlanningGroup(status) {
  const key = STATUS_TO_GROUP[status] || "pending";
  return PLANNING_GROUPS[key];
}

// Ordem fixa pra legenda — não depende de quais status aparecem nos
// plannings vinculados no momento.
export const PLANNING_GROUP_LEGEND = [
  PLANNING_GROUPS.pending,
  PLANNING_GROUPS.in_progress,
  PLANNING_GROUPS.completed,
  PLANNING_GROUPS.cancelled,
];

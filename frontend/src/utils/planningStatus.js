// Centraliza o que antes estava duplicado em PlanningCard.jsx,
// PlanningDetailModal.jsx e DayIdeasModal.jsx. Se um dia adicionar um novo
// status, muda só aqui.
export const PLANNING_STATUS_OPTIONS = [
  "Not Started",
  "Under Review",
  "Started",
  "In Development",
  "Completed",
];

export const PLANNING_STATUS_STYLES = {
  "Not Started": "bg-gray-100 text-gray-600 border-gray-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Started": "bg-purple-50 text-purple-700 border-purple-200",
  "In Development": "bg-amber-50 text-amber-700 border-amber-200",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
};
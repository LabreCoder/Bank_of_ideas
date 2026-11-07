// Estilos de status de ideia (D07) — fonte única, junto com os de planning
// (utils/planningStatus.js). Antes, "In Planning" era âmbar no IdeaCard e
// índigo no IdeaDetailPanel. Índigo evita confundir com o âmbar de
// "In Development" (status de planning).
export { STATUS_FALLBACK_STYLE } from "./planningStatus.js";

export const IDEA_STATUS_STYLES = {
  Free: "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
  "In Planning": "bg-status-indigo-bg text-status-indigo-fg border-status-indigo-border",
};

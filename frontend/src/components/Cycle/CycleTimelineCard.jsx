import { formatShortDate } from "../../utils/dateFormat";

import {
  CYCLE_OVERDUE_LABEL,
  CYCLE_OVERDUE_STYLE,
  CYCLE_STATUS_STYLES,
  STATUS_FALLBACK_STYLE,
} from "../../utils/cycleStatus";

export default function CycleTimelineCard({ cycle, onClick }) {
  const statusClass =
    CYCLE_STATUS_STYLES[cycle.status] || STATUS_FALLBACK_STYLE;
  const isFinished = cycle.status === "Finished";
  const progressBarClass = isFinished ? "bg-emerald-500" : "bg-accent-600";

  return (
    <div
      onClick={() => onClick(cycle)}
      className="bg-ui-surface border border-ui-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-ui-text-primary text-base">{cycle.name}</h4>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {cycle.is_overdue && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CYCLE_OVERDUE_STYLE}`}>
              {CYCLE_OVERDUE_LABEL}
            </span>
          )}
          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
          {cycle.status}
        </span>
        </div>
      </div>

      {cycle.description && (
        <p className="text-sm text-ui-text-secondary line-clamp-2 mb-4">{cycle.description}</p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-ui-text-muted mb-1">
          <span>Progress</span>
          <span className="font-medium text-ui-text-secondary">{cycle.progress_percentage}%</span>
        </div>
        <div className="h-1.5 bg-ui-surface-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressBarClass}`}
            style={{ width: `${cycle.progress_percentage}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-ui-border/60 flex justify-between text-xs text-ui-text-muted">
        <span>
          {cycle.completed_plannings} / {cycle.total_plannings} plannings
        </span>
        <span>
          {cycle.due_date
            ? `${isFinished ? "Finished" : "Due"} ${formatShortDate(cycle.due_date)}`
            : "No due date"}
        </span>
      </div>
    </div>
  );
}

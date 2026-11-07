import { formatShortDate } from "../../utils/dateFormat";

const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-ui-surface-2 text-ui-text-secondary border-ui-border",
  "In Progress": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
  "Finished": "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
};

export default function CycleTimelineCard({ cycle, onClick }) {
  const statusClass =
    CYCLE_STATUS_STYLES[cycle.status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";
  const isFinished = cycle.status === "Finished";
  const progressBarClass = isFinished ? "bg-emerald-500" : "bg-accent-600";

  return (
    <div
      onClick={() => onClick(cycle)}
      className="bg-ui-surface border border-ui-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-ui-text-primary text-base">{cycle.name}</h4>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
          {cycle.status}
        </span>
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
          {isFinished ? "Finished" : "Due"} {formatShortDate(cycle.due_date)}
        </span>
      </div>
    </div>
  );
}

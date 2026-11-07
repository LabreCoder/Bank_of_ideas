import ProgressBar from "../Default/ProgressBar";
import { formatMediumDate } from "../../utils/dateFormat";

const STATUS_STYLES = {
  "Not Started": "bg-ui-surface-2 text-ui-text-secondary border-ui-border",
  "Under Review": "bg-status-blue-bg text-status-blue-fg border-status-blue-border",
  "Started": "bg-status-purple-bg text-status-purple-fg border-status-purple-border",
  "In Development": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
  "Completed": "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
  "Cancelled": "bg-status-red-bg text-status-red-fg border-status-red-border",
};

export default function PlanningCard({ planning, checklist, onOpen }) {
  const statusClass =
    STATUS_STYLES[planning.status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";
  const total = checklist.length;
  const done = checklist.filter((i) => i.is_done).length;

  return (
    <button
      onClick={() => onOpen(planning)}
      className="text-left bg-ui-surface rounded-lg border border-ui-border p-4 flex flex-col justify-between gap-3 hover:border-accent-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-ui-text-primary leading-snug">{planning.idea.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {planning.status}
        </span>
      </div>

      {total > 0 && (
        <div className="mt-1">
          <ProgressBar label="Checklist" current={done} total={total} />
        </div>
      )}

      <div className="pt-3 border-t border-ui-border/60 flex justify-between text-xs text-ui-text-muted">
        <div>
          <span>Start: {formatMediumDate(planning.start_date)}</span>
        </div>
        <div>
          <span>End: {formatMediumDate(planning.due_date)}</span>
        </div>
      </div>
    </button>
  );
}
import { Link } from "react-router-dom";
import { getCategoryColor } from "../../utils/categoryColors";
import { formatDueLabel, isOverdue } from "../../utils/dashboardMetrics";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

const MAX_ROWS = 4;
const GRID_COLUMNS = "md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)_5rem_8.5rem]";

function nextStepLabel(row) {
  if (row.nextStep) return `Next: ${row.nextStep}`;
  return row.total > 0 ? "All checklist items done" : "No checklist yet";
}

export default function ProjectsTable({ rows, colorMap, onOpenPlanning }) {
  const visibleRows = rows.slice(0, MAX_ROWS);

  return (
    <section className="h-full rounded-2xl border border-ui-border bg-ui-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ui-text-muted">
            03 / Make the next move
          </p>
          <h3 className="mt-3 text-xl font-medium text-ui-text-primary">Projects that need you</h3>
        </div>
        <Link to="/planning" className="shrink-0 text-xs text-accent-500 hover:text-accent-600">
          All {rows.length} active plans &rarr;
        </Link>
      </div>

      {visibleRows.length === 0 ? (
        <p className="mt-6 text-sm text-ui-text-muted">No open plannings.</p>
      ) : (
        <div className="mt-6">
          <div
            className={`hidden gap-4 border-b border-ui-border pb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ui-text-muted md:grid ${GRID_COLUMNS}`}
          >
            <span>Project / next step</span>
            <span>Checklist</span>
            <span>Due</span>
            <span>Status</span>
          </div>

          <ul className="divide-y divide-ui-border">
            {visibleRows.map((row) => {
              const color = getCategoryColor(colorMap, row.categoryId);
              const overdue = isOverdue(row.planning);
              return (
                <li key={row.planning.id}>
                  <button
                    type="button"
                    onClick={() => onOpenPlanning(row.planning.id)}
                    className={`grid w-full grid-cols-2 items-center gap-x-4 gap-y-3 py-4 text-left transition-colors hover:bg-ui-surface-2/60 ${GRID_COLUMNS}`}
                  >
                    <div className="col-span-2 min-w-0 md:col-span-1">
                      <p className="flex items-center gap-2 text-sm font-medium text-ui-text-primary">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                        <span className="truncate">{row.planning.idea.name}</span>
                      </p>
                      <p className="mt-1 truncate pl-3.5 text-xs text-ui-text-muted">{nextStepLabel(row)}</p>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-[11px] text-ui-text-muted">
                        <span>{row.done}/{row.total}</span>
                        <span>{row.pct}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-ui-surface-2">
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, backgroundColor: color }} />
                      </div>
                    </div>

                    <span
                      className={`font-mono text-xs ${overdue ? "text-rose-500" : "text-ui-text-secondary"}`}
                    >
                      {formatDueLabel(row.planning.due_date)}
                    </span>

                    <span
                      className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        PLANNING_STATUS_STYLES[row.planning.status] ?? PLANNING_STATUS_STYLES["Not Started"]
                      }`}
                    >
                      {row.planning.status}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

import { localDateToKey } from "../../utils/calendar";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";
import { getChecklistProgress, getDayPlanningEntriesByDate } from "./calendarViewUtils";

export default function CalendarDayView({ dayDate, plannings, onOpenPlanning }) {
  const dateKey = localDateToKey(dayDate);
  const dayPlannings = getDayPlanningEntriesByDate(plannings, dayDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ui-text-secondary">
          {dayDate.toLocaleDateString("en-US", { weekday: "long" })}
        </p>
        <span className="text-xs text-ui-text-muted">
          {dayDate.toLocaleDateString("en-US", { day: "2-digit", month: "long", year: "numeric" })}
        </span>
      </div>

      {dayPlannings.length === 0 ? (
        <div className="rounded-lg border border-ui-border p-4 bg-ui-surface-2 text-sm text-ui-text-muted">
          No planning has checklist items due on this day.
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {dayPlannings.map((planning) => {
            const progress = getChecklistProgress(planning.checklist_items || []);

            return (
              <li key={planning.id} className="bg-ui-surface-2 rounded-md p-3 border border-ui-border min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-sm font-medium text-ui-text-primary truncate">
                    {planning.idea?.name || "Untitled"}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
                      PLANNING_STATUS_STYLES[planning.status] ||
                      "bg-ui-surface-2 text-ui-text-secondary border-ui-border"
                    }`}
                  >
                    {planning.status}
                  </span>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-ui-text-secondary mb-1">
                    <span>Checklist progress</span>
                    <span className="font-semibold">
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ui-border overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>

                <p className="text-xs font-semibold text-ui-text-secondary mb-1">Items due on this day</p>
                {planning.dayChecklistItems.length > 0 ? (
                  <ul className="space-y-1 mb-3">
                    {planning.dayChecklistItems.map((item) => (
                      <li
                        key={item.id}
                        className="text-xs text-ui-text-secondary bg-ui-surface rounded border border-ui-border px-2 py-1"
                      >
                        <span className={item.is_done ? "line-through text-ui-text-muted" : ""}>
                          {item.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-ui-text-muted mb-3">No checklist items due on this day.</p>
                )}

                <button
                  type="button"
                  onClick={() => onOpenPlanning?.(planning.id)}
                  className="text-xs rounded-md border border-ui-border px-2 py-1 hover:bg-ui-surface-2"
                >
                  Open in Planning
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { localDateToKey, WEEKDAY_LABELS } from "../../utils/calendar";
import { getChecklistProgress, getDayPlanningEntries } from "./calendarViewUtils";

export default function CalendarWeekView({ weekDates, plannings, onDayClick }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
      {weekDates.map((date) => {
        const key = localDateToKey(date);
        const dayPlannings = getDayPlanningEntries(plannings, key);

        const totals = dayPlannings.reduce(
          (acc, planning) => {
            const progress = getChecklistProgress(planning.checklist_items || []);
            return {
              total: acc.total + progress.total,
              done: acc.done + progress.done,
            };
          },
          { total: 0, done: 0 }
        );

        return (
          <button
            key={key}
            onClick={() => onDayClick(key, dayPlannings)}
            className="border border-ui-border rounded-md p-3 text-left bg-ui-surface-2 hover:bg-ui-surface-2 transition-colors justify-between flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ui-text-secondary">{WEEKDAY_LABELS[date.getDay()]}</span>
              <span className="text-xs text-ui-text-muted">{date.getDate()}</span>
            </div>
            <div className="text-xs text-ui-text-secondary space-y-1 mb-auto">
              <p>
                <span className="font-semibold">Plannings:</span> {dayPlannings.length}
              </p>
              <p>
                <span className="font-semibold">Checklist:</span> {totals.done}/{totals.total}
              </p>
            </div>

            {dayPlannings.length > 0 && (
              <div className="flex flex-col mt-2 space-y-3 border-t border-ui-border pt-4">
                {dayPlannings.slice(0, 2).map((planning) => (
                  <div key={planning.id} className="rounded border border-ui-border bg-ui-surface p-2 mt-auto">
                    <p className="text-[11px] font-semibold text-ui-text-secondary truncate">{planning.idea?.name}</p>
                    <ul className="mt-1 space-y-0.5">
                      {planning.dayChecklistItems.slice(0, 2).map((item) => (
                        <li key={item.id} className="text-[10px] text-ui-text-muted truncate">
                          {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {dayPlannings.length > 2 && (
                  <p className="text-[10px] text-ui-text-muted">+{dayPlannings.length - 2} more planning(s)</p>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

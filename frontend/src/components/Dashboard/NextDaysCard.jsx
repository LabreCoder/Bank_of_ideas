import { getCategoryColor } from "../../utils/categoryColors";

const MAX_ROWS = 4;
const MAX_DOTS = 3;
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export default function NextDaysCard({ days, ideaById, colorMap, onDayClick, onOpenPlanning }) {
  const monthLabel = days[0].date
    .toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    .replace(" ", " '");

  const deadlines = days
    .flatMap((day) => day.plannings.map((planning) => ({ day, planning })))
    .slice(0, MAX_ROWS);

  return (
    <section className="h-full rounded-2xl border border-ui-border bg-ui-surface p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ui-text-muted">
            04 / On the horizon
          </p>
          <h3 className="mt-3 text-xl font-medium text-ui-text-primary">The next 7 days</h3>
        </div>
        <span className="font-mono text-[11px] uppercase text-ui-text-muted">{monthLabel}</span>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5">
        {days.map((day) => {
          const hasPlannings = day.plannings.length > 0;
          return (
            <button
              key={day.key}
              type="button"
              disabled={!hasPlannings}
              onClick={() => onDayClick(day.key, day.plannings)}
              className={`flex flex-col items-center gap-1 rounded-lg py-2.5 transition-colors ${
                day.isToday
                  ? "bg-accent-600 text-white"
                  : "bg-ui-surface-2 text-ui-text-primary enabled:hover:bg-ui-border/40"
              } ${hasPlannings ? "" : "cursor-default"}`}
            >
              <span className={`font-mono text-[10px] ${day.isToday ? "text-white/70" : "text-ui-text-muted"}`}>
                {WEEKDAY_INITIALS[day.date.getDay()]}
              </span>
              <span className="text-lg tabular-nums">{day.date.getDate()}</span>
              <span className="flex h-1.5 gap-0.5">
                {day.plannings.slice(0, MAX_DOTS).map((planning) => (
                  <span
                    key={planning.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: getCategoryColor(colorMap, ideaById.get(planning.idea.id)?.category?.id),
                    }}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {deadlines.length === 0 ? (
        <p className="mt-6 text-sm text-ui-text-muted">No deadlines in the next 7 days.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ui-border">
          {deadlines.map(({ day, planning }) => {
            const categoryName = ideaById.get(planning.idea.id)?.category?.name;
            return (
              <li key={planning.id}>
                <button
                  type="button"
                  onClick={() => onOpenPlanning(planning.id)}
                  className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-ui-surface-2/60"
                >
                  <span className="w-10 shrink-0 text-center">
                    <span className="block text-2xl font-light tabular-nums leading-none text-ui-text-primary">
                      {String(day.date.getDate()).padStart(2, "0")}
                    </span>
                    <span className="mt-1 block font-mono text-[10px] uppercase text-ui-text-muted">
                      {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ui-text-primary">
                      {planning.idea.name}
                    </span>
                    <span className="block truncate text-xs text-ui-text-muted">
                      {[categoryName, planning.status].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="text-ui-text-muted">&rsaquo;</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

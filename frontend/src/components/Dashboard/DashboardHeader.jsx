import { CYCLE_FILTER_ALL, CYCLE_FILTER_NONE } from "../../utils/dashboardMetrics";

export default function DashboardHeader({ cycles, cycleFilter, onCycleFilterChange, onNewIdea }) {
  const dateLabel = new Date().toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ui-text-muted">
          Your idea observatory / {dateLabel}
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ui-text-primary md:text-5xl">
          Big ideas. Real momentum.
        </h2>
        <p className="mt-3 text-sm text-ui-text-secondary">
          A clear view of what&apos;s taking shape and what needs your next move.
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <select
          value={cycleFilter}
          onChange={(e) => onCycleFilterChange(e.target.value)}
          aria-label="Filter dashboard by cycle"
          className="max-w-[14rem] rounded-lg border border-ui-border bg-ui-surface px-3 py-2.5 text-sm text-ui-text-primary focus:outline-none focus:ring-1 focus:ring-accent-600"
        >
          <option value={CYCLE_FILTER_ALL}>All cycles</option>
          <option value={CYCLE_FILTER_NONE}>No cycle</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={String(cycle.id)}>
              {cycle.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onNewIdea}
          className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-700"
        >
          <span className="text-lg leading-none">+</span> New idea
        </button>
      </div>
    </header>
  );
}

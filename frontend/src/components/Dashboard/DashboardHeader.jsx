import { CYCLE_FILTER_ALL, CYCLE_FILTER_NONE } from "../../utils/dashboardMetrics";
import { formatMediumDate } from "../../utils/dateFormat";
import { Button, Select } from "../ui";

export default function DashboardHeader({ cycles, cycleFilter, onCycleFilterChange, onNewIdea }) {
  const dateLabel = formatMediumDate(new Date());

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

      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <Select
          value={cycleFilter}
          onChange={(e) => onCycleFilterChange(e.target.value)}
          aria-label="Filter dashboard by cycle"
          fullWidth={false}
          className="max-w-[14rem]"
        >
          <option value={CYCLE_FILTER_ALL}>All cycles</option>
          <option value={CYCLE_FILTER_NONE}>No cycle</option>
          {cycles.map((cycle) => (
            <option key={cycle.id} value={String(cycle.id)}>
              {cycle.name}
            </option>
          ))}
        </Select>

        <Button onClick={onNewIdea}>
          <span className="text-lg leading-none">+</span> New idea
        </Button>
      </div>
    </header>
  );
}

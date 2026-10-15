import { useMemo } from "react";
import StatCard from "../Default/StatCard";
import { formatShortDate } from "../../utils/dateFormat";

export default function CyclesSummary({ cycles }) {
  const stats = useMemo(() => {
    const activeCycles = cycles.filter((c) => c.status !== "Finished");

    const totalPlannings = cycles.reduce((sum, c) => sum + c.total_plannings, 0);

    const upcomingDueDates = activeCycles
      .map((c) => c.due_date)
      .filter((d) => d !== null);
    const nextDueDate = upcomingDueDates.length > 0 ? upcomingDueDates.sort()[0] : null;

    return {
      activeCount: activeCycles.length,
      totalPlannings,
      nextDueDate,
    };
  }, [cycles]);

  return (
    <div className="animate-fade-in pb-10">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ui-text-primary md:text-5xl">
              Cycles
            </h2>
            <p className="mt-3 text-lg text-ui-text-secondary italic">
              Overview of all cycles. Track progress and upcoming deadlines.
            </p>
          </div>
        </header>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Actives" value={stats.activeCount} />
        <StatCard title="Plannings" value={stats.totalPlannings} />
        <StatCard title="Next Due Date" value={formatShortDate(stats.nextDueDate)} />
      </div>
    </div>
  );
}

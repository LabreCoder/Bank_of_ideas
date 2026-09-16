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
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-1">Ciclos em andamento e concluídos</h2>
      <p className="text-gray-500 mb-4">
        Status, progresso e prazos dos seus planejamentos em um só lugar.
      </p>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Ativos" value={stats.activeCount} />
        <StatCard title="Planejamentos" value={stats.totalPlannings} />
        <StatCard title="Próximo prazo" value={formatShortDate(stats.nextDueDate)} />
      </div>
    </div>
  );
}

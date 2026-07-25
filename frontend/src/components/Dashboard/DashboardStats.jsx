import { useMemo } from "react";
import StatCard from "../StatCard";
import  PizzaGraphic  from "./Graphics/Pizza";
import SimpleRadarChart from "./Graphics/Radar";
import { PLANNING_STATUS_OPTIONS, PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

export default function DashboardStats({ ideas, plannings, categories }) {
  const stats = useMemo(() => {
    const totalIdeas = ideas.length;
    const activeIdeas = ideas.filter((i) => i.is_active).length;
    const inactiveIdeas = totalIdeas - activeIdeas;

    const FreeCount = ideas.filter((i) => i.execution_status === "Free").length;
    const inPlanningCount = totalIdeas - FreeCount;

    const planningsByStatus = PLANNING_STATUS_OPTIONS.reduce((acc, status) => {
      acc[status] = plannings.filter((p) => p.status === status).length;
      return acc;
    }, {});

    const categoriesIdeasCount = categories.reduce((acc, categories) => {
      acc[categories.id] = ideas.filter((idea) => idea.category.id === categories.id).length;
      return acc;
    }, {});
    
    const allChecklistItems = plannings.flatMap((p) => p.checklist_items);
    const doneItems = allChecklistItems.filter((item) => item.is_done).length;
    const totalItems = allChecklistItems.length;
    const checklistProgress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    return {
      totalIdeas,
      activeIdeas,
      inactiveIdeas,
      FreeCount,
      inPlanningCount,
      planningsByStatus,
      totalPlannings: plannings.length,
      doneItems,
      totalItems,
      checklistProgress,
      categoriesIdeasCount,
    };
  }, [ideas, plannings, categories]);

  const FreePct = stats.totalIdeas ? (stats.FreeCount / stats.totalIdeas) * 100 : 0;

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-4 text-center text-sm" >
        <PizzaGraphic categories={categories} ideas={ideas} />
        <SimpleRadarChart categories={categories} ideas={ideas} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4 text-center text-sm">
        <StatCard title="Execution status" value={`${stats.FreeCount} / ${stats.totalIdeas}`} >
          <div className="h-3 bg-amber-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-500" style={{ width: `${FreePct}%` }} />
          </div>
          <div className="flex justify-between text-[12px] text-gray-400 mt-1">
            <span>Free: {stats.FreeCount}</span>
            <span>In Planning: {stats.inPlanningCount}</span>
          </div>
        </StatCard>

        <StatCard title="Plannings">
          <ul className="flex flex-col gap-3 mt-1">
            {PLANNING_STATUS_OPTIONS.map((status) => (
              <li key={status} className="flex items-center justify-between text-xs">
                <span
                  className={`px-3 py-1 rounded-full border text-[14px] ${PLANNING_STATUS_STYLES[status]}`}
                >
                  {status}
                </span>
                <span className="text-gray-500 font-medium">{stats.planningsByStatus[status]}</span>
              </li>
            ))}
          </ul>
        </StatCard>

        <StatCard
          title="Checklist progress"
          value={`${stats.checklistProgress}%`}
          subtitle={`${stats.doneItems} of ${stats.totalItems} items done`}
        >
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mt-1 text-[12px]">
            <div className="h-full bg-accent-600" style={{ width: `${stats.checklistProgress}%` }} />
          </div>
        </StatCard>
      </div>
    </div>
  );
}
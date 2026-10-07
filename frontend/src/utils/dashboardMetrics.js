// Funções puras que transformam os dados da API nos números do Dashboard.
// Ficam fora dos componentes pra que cada bloco só receba o que vai exibir.
import { addDays, dateKeyToLocalDate, localDateToKey, startOfDay } from "./calendar";

export const CYCLE_FILTER_ALL = "all";
export const CYCLE_FILTER_NONE = "none";

const TERMINAL_STATUSES = new Set(["Completed", "Cancelled"]);

export const UPCOMING_DAYS = 7;

export const FUNNEL_STAGES = [
  { key: "captured", label: "Captured", hint: "Room to explore" },
  { key: "shaping", label: "Taking shape", hint: "Research & planning" },
  { key: "execution", label: "In execution", hint: "Turning plans into work" },
  { key: "shipped", label: "Shipped", hint: "Out in the world" },
];

const STATUS_TO_STAGE = {
  "Not Started": "shaping",
  "Under Review": "shaping",
  "Started": "execution",
  "In Development": "execution",
  "Completed": "shipped",
};

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function isOpenPlanning(planning) {
  return !TERMINAL_STATUSES.has(planning.status);
}

// ---------------------------------------------------------------------------
// Filtro de cycle
// ---------------------------------------------------------------------------
// - "all":   tudo, com e sem cycle (inclui ideias Free).
// - "none":  plannings sem nenhum cycle + ideias Free.
// - <id>:    só os plannings daquele cycle e as ideias deles. Ideias Free não
//            pertencem a nenhum cycle, então ficam de fora.
export function filterByCycle(ideas, plannings, cycles, cycleFilter) {
  if (cycleFilter === CYCLE_FILTER_ALL) return { ideas, plannings };

  if (cycleFilter === CYCLE_FILTER_NONE) {
    const boundPlanningIds = new Set(cycles.flatMap((cycle) => cycle.plannings.map((p) => p.id)));
    const unboundPlannings = plannings.filter((p) => !boundPlanningIds.has(p.id));
    const boundIdeaIds = new Set(
      plannings.filter((p) => boundPlanningIds.has(p.id)).map((p) => p.idea.id)
    );
    return {
      ideas: ideas.filter((idea) => !boundIdeaIds.has(idea.id)),
      plannings: unboundPlannings,
    };
  }

  const cycle = cycles.find((c) => String(c.id) === String(cycleFilter));
  const planningIds = new Set((cycle?.plannings ?? []).map((p) => p.id));
  const scopedPlannings = plannings.filter((p) => planningIds.has(p.id));
  const ideaIds = new Set(scopedPlannings.map((p) => p.idea.id));
  return {
    ideas: ideas.filter((idea) => ideaIds.has(idea.id)),
    plannings: scopedPlannings,
  };
}

// ---------------------------------------------------------------------------
// Funil por estágio ("From spark to shipped")
// ---------------------------------------------------------------------------
// Ideias inativas e plannings cancelados não entram no funil.
export function buildFunnel(ideas, plannings) {
  const planningByIdeaId = new Map(plannings.map((p) => [p.idea.id, p]));
  const buckets = Object.fromEntries(FUNNEL_STAGES.map((stage) => [stage.key, []]));

  for (const idea of ideas) {
    if (!idea.is_active) continue;
    const planning = planningByIdeaId.get(idea.id);
    const stageKey = planning ? STATUS_TO_STAGE[planning.status] : "captured";
    if (stageKey) buckets[stageKey].push(idea);
  }

  const total = FUNNEL_STAGES.reduce((sum, stage) => sum + buckets[stage.key].length, 0);
  const stages = FUNNEL_STAGES.map((stage) => {
    const stageIdeas = buckets[stage.key];
    return {
      ...stage,
      ideas: stageIdeas,
      count: stageIdeas.length,
      pct: total ? (stageIdeas.length / total) * 100 : 0,
    };
  });

  return { stages, total };
}

// ---------------------------------------------------------------------------
// Datas
// ---------------------------------------------------------------------------
export function getUpcomingDays(plannings, today = new Date()) {
  const start = startOfDay(today);
  return Array.from({ length: UPCOMING_DAYS }, (_, index) => {
    const date = addDays(start, index);
    const key = localDateToKey(date);
    return {
      date,
      key,
      isToday: index === 0,
      plannings: plannings.filter((p) => isOpenPlanning(p) && p.due_date === key),
    };
  });
}

export function formatDueLabel(dateKey) {
  if (!dateKey) return "No due date";
  return dateKeyToLocalDate(dateKey).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

export function isOverdue(planning, today = new Date()) {
  return Boolean(planning.due_date) && planning.due_date < localDateToKey(startOfDay(today));
}

// ---------------------------------------------------------------------------
// KPIs
// ---------------------------------------------------------------------------
export function buildKpis(funnel, plannings, categoryRows, upcomingDays) {
  const checklistItems = plannings.flatMap((p) => p.checklist_items ?? []);
  const doneItems = checklistItems.filter((item) => item.is_done).length;
  const totalItems = checklistItems.length;

  const executionCount = funnel.stages.find((s) => s.key === "execution")?.count ?? 0;
  const upcomingCount = upcomingDays.reduce((sum, day) => sum + day.plannings.length, 0);

  return {
    bankCount: funnel.total,
    categoriesCount: categoryRows.length,
    executionCount,
    executionPct: funnel.total ? Math.round((executionCount / funnel.total) * 100) : 0,
    checklistPct: totalItems ? Math.round((doneItems / totalItems) * 100) : 0,
    doneItems,
    totalItems,
    upcomingCount,
  };
}

// ---------------------------------------------------------------------------
// Balanço por categoria ("A balanced bank?")
// ---------------------------------------------------------------------------
export function buildCategoryBalance(ideas, categories) {
  const activeIdeas = ideas.filter((idea) => idea.is_active);
  const total = activeIdeas.length;

  const rows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    count: activeIdeas.filter((idea) => idea.category?.id === category.id).length,
  }));

  const uncategorized = activeIdeas.filter((idea) => !idea.category).length;
  if (uncategorized > 0) rows.push({ id: null, name: "No category", count: uncategorized });

  return rows
    .filter((row) => row.count > 0)
    .map((row) => ({ ...row, pct: total ? (row.count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------------------
// Tabela "Projects that need you"
// ---------------------------------------------------------------------------
// Plannings em aberto, do prazo mais próximo ao mais distante (sem prazo por último).
export function buildProjectRows(plannings, ideaById) {
  return plannings
    .filter(isOpenPlanning)
    .sort((a, b) => {
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return a.due_date.localeCompare(b.due_date);
    })
    .map((planning) => {
      const items = [...(planning.checklist_items ?? [])].sort((a, b) => a.position - b.position);
      const done = items.filter((item) => item.is_done).length;
      return {
        planning,
        categoryId: ideaById.get(planning.idea.id)?.category?.id ?? null,
        categoryName: ideaById.get(planning.idea.id)?.category?.name ?? null,
        nextStep: items.find((item) => !item.is_done)?.description ?? null,
        done,
        total: items.length,
        pct: items.length ? Math.round((done / items.length) * 100) : 0,
      };
    });
}

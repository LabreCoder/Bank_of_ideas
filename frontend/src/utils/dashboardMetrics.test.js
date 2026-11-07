// C06 — todos os blocos do Dashboard usam o mesmo conjunto (sem ideias inativas).
//   docker compose exec frontend npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  CYCLE_FILTER_ALL,
  CYCLE_FILTER_NONE,
  buildCategoryBalance,
  buildFunnel,
  buildKpis,
  buildProjectRows,
  filterByCycle,
  getUpcomingDays,
} from "./dashboardMetrics.js";
import { localDateToKey } from "./calendar.js";

const today = new Date(2026, 10, 7);
const todayKey = localDateToKey(today);

const category = { id: 1, name: "Dev" };
const activeIdea = { id: 1, name: "Ativa", is_active: true, category };
const inactiveIdea = { id: 2, name: "Inativa", is_active: false, category };

const planning = (id, idea, items) => ({
  id,
  idea: { id: idea.id, name: idea.name, is_active: idea.is_active },
  status: "Started",
  due_date: todayKey,
  checklist_items: items,
});

const ideas = [activeIdea, inactiveIdea];
const plannings = [
  planning(10, activeIdea, [{ id: 1, is_done: true, position: 0, description: "a" }]),
  planning(20, inactiveIdea, [
    { id: 2, is_done: false, position: 0, description: "b" },
    { id: 3, is_done: false, position: 1, description: "c" },
  ]),
];
const cycles = [{ id: 5, plannings: [{ id: 20 }] }];

function dashboard(cycleFilter) {
  const scoped = filterByCycle(ideas, plannings, cycles, cycleFilter);
  const funnel = buildFunnel(scoped.ideas, scoped.plannings);
  const categoryRows = buildCategoryBalance(scoped.ideas, [category]);
  const upcoming = getUpcomingDays(scoped.plannings, today);
  const kpis = buildKpis(funnel, scoped.plannings, categoryRows, upcoming);
  const rows = buildProjectRows(scoped.plannings, new Map(ideas.map((i) => [i.id, i])));
  return { scoped, funnel, kpis, rows, upcoming };
}

test("inactive ideas and their plannings are excluded from every block", () => {
  const { scoped, funnel, kpis, rows, upcoming } = dashboard(CYCLE_FILTER_ALL);
  assert.deepEqual(scoped.ideas.map((i) => i.id), [1]);
  assert.deepEqual(scoped.plannings.map((p) => p.id), [10]);
  assert.equal(funnel.total, 1);
  assert.deepEqual(rows.map((r) => r.planning.id), [10]); // tabela "Projects"
  assert.deepEqual(upcoming[0].plannings.map((p) => p.id), [10]); // próximos dias / calendário
  assert.equal(kpis.totalItems, 1); // % de checklist só da ideia ativa
  assert.equal(kpis.checklistPct, 100);
  assert.equal(kpis.upcomingCount, 1);
});

test("cycle filters also ignore inactive ideas", () => {
  assert.deepEqual(dashboard("5").scoped.plannings, []); // ciclo só tem o planning inativo
  assert.deepEqual(dashboard(CYCLE_FILTER_NONE).scoped.plannings.map((p) => p.id), [10]);
});

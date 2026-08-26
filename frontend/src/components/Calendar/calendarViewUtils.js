import { localDateToKey } from "../../utils/calendar";

export function getChecklistItemsForDate(planning, dateKey) {
  return (planning.checklist_items || []).filter((item) => item.due_date === dateKey);
}

export function getDayPlanningEntries(plannings, dateKey) {
  return plannings
    .map((planning) => {
      const dayChecklistItems = getChecklistItemsForDate(planning, dateKey);
      return {
        ...planning,
        dayChecklistItems,
      };
    })
    .filter((planning) => planning.dayChecklistItems.length > 0)
    .sort((a, b) => b.dayChecklistItems.length - a.dayChecklistItems.length);
}

export function getChecklistProgress(checklistItems = []) {
  const total = checklistItems.length;
  const done = checklistItems.filter((item) => item.is_done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return { total, done, percent };
}

export function getDayPlanningEntriesByDate(plannings, dayDate) {
  const dateKey = localDateToKey(dayDate);
  return getDayPlanningEntries(plannings, dateKey);
}

import DetailModal from "../Default/DetailModal";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function checklistSummary(checklistItems = []) {
  const total = checklistItems.length;
  const done = checklistItems.filter((item) => item.is_done).length;
  return { total, done };
}

function progressPercent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function checklistItemsForDate(checklistItems = [], dateKey) {
  return checklistItems.filter((item) => item.due_date === dateKey);
}

function MonthPlanningCard({ planning, dateKey, onOpenPlanning }) {
  const { total, done } = checklistSummary(planning.checklist_items || []);

  return (
    <li className="bg-gray-50 rounded-md p-3 border border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm font-medium text-gray-800">{planning.idea?.name || "Untitled"}</span>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            PLANNING_STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {planning.status}
        </span>
      </div>

      <div className="text-xs text-gray-600 mb-3">
        <p>
          Checklist progress: <span className="font-semibold">{done}/{total}</span>
        </p>
        <p className="mt-0.5">Due date: {formatDateLabel(dateKey)}</p>
      </div>

      <button
        type="button"
        onClick={() => onOpenPlanning?.(planning.id)}
        className="text-xs rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
      >
        Open in Planning
      </button>
    </li>
  );
}

function WeekPlanningCard({ planning, dateKey, onOpenPlanning }) {
  const dueItems = checklistItemsForDate(planning.checklist_items, dateKey);
  const { total, done } = checklistSummary(planning.checklist_items || []);

  return (
    <li className="bg-gray-50 rounded-md p-3 border border-gray-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm font-medium text-gray-800">{planning.idea?.name || "Untitled"}</span>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            PLANNING_STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {planning.status}
        </span>
      </div>

      <div className="text-xs text-gray-600 mb-2">
        <p>
          Full checklist progress: <span className="font-semibold">{done}/{total}</span>
        </p>
        <p className="mt-0.5">
          Items due on this day: <span className="font-semibold">{dueItems.length}</span>
        </p>
      </div>

      {dueItems.length > 0 ? (
        <ul className="space-y-1 mb-3">
          {dueItems.map((item) => (
            <li key={item.id} className="text-xs text-gray-700 bg-white rounded border border-gray-200 px-2 py-1">
              <span className={item.is_done ? "line-through text-gray-500" : ""}>{item.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 mb-3">No checklist items due on this day.</p>
      )}

      <button
        type="button"
        onClick={() => onOpenPlanning?.(planning.id)}
        className="text-xs rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
      >
        Open in Planning
      </button>
    </li>
  );
}

function DayPlanningCard({ planning, dateKey, onOpenPlanning }) {
  const allItems = planning.checklist_items || [];
  const dueTodayItems = checklistItemsForDate(allItems, dateKey);
  const { total, done } = checklistSummary(allItems);
  const pct = progressPercent(done, total);

  return (
    <li className="bg-gray-50 rounded-md p-3 border border-gray-200 min-w-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-sm font-medium text-gray-800 truncate">{planning.idea?.name || "Untitled"}</span>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${
            PLANNING_STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {planning.status}
        </span>
      </div>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Checklist progress</span>
          <span className="font-semibold">{done}/{total}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-700 mb-1">Items due on this day</p>
      {dueTodayItems.length > 0 ? (
        <ul className="space-y-1 mb-3">
          {dueTodayItems.map((item) => (
            <li key={item.id} className="text-xs text-gray-700 bg-white rounded border border-gray-200 px-2 py-1">
              <span className={item.is_done ? "line-through text-gray-500" : ""}>{item.description}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-500 mb-3">No checklist items due on this day.</p>
      )}

      <button
        type="button"
        onClick={() => onOpenPlanning?.(planning.id)}
        className="text-xs rounded-md border border-gray-300 px-2 py-1 hover:bg-gray-100"
      >
        Open in Planning
      </button>
    </li>
  );
}

export default function DayIdeasModal({ dateKey, plannings, view, onOpenPlanning, onClose }) {
  const viewTitle =
    view === "day" ? "Day details" : view === "week" ? "Week day details" : "Month day details";

  const weekPlannings = plannings
    .map((planning) => ({
      ...planning,
      dayChecklistItems: checklistItemsForDate(planning.checklist_items, dateKey),
    }))
    .filter((planning) => planning.dayChecklistItems.length > 0)
    .sort((a, b) => b.dayChecklistItems.length - a.dayChecklistItems.length);

  const dayPlannings = [...weekPlannings];
  const monthPlannings = plannings;

  const renderByView = () => {
    if (view === "week") {
      if (!weekPlannings.length) {
        return <p className="text-sm text-gray-500">No planning has checklist items due on this day.</p>;
      }

      return (
        <ul className="flex flex-col gap-3">
          {weekPlannings.map((planning) => (
            <WeekPlanningCard
              key={planning.id}
              planning={planning}
              dateKey={dateKey}
              onOpenPlanning={onOpenPlanning}
            />
          ))}
        </ul>
      );
    }

    if (view === "day") {
      if (!dayPlannings.length) {
        return <p className="text-sm text-gray-500">No planning has checklist items due on this day.</p>;
      }

      return (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {dayPlannings.map((planning) => (
            <DayPlanningCard
              key={planning.id}
              planning={planning}
              dateKey={dateKey}
              onOpenPlanning={onOpenPlanning}
            />
          ))}
        </ul>
      );
    }

    if (!monthPlannings.length) {
      return <p className="text-sm text-gray-500">No plannings for this day.</p>;
    }

    return (
      <ul className="flex flex-col gap-3">
        {monthPlannings.map((planning) => (
          <MonthPlanningCard
            key={planning.id}
            planning={planning}
            dateKey={dateKey}
            onOpenPlanning={onOpenPlanning}
          />
        ))}
      </ul>
    );
  };

  return (
    <DetailModal onClose={onClose} size="xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">{viewTitle}</p>
            <h3 className="text-lg font-semibold capitalize">{formatDateLabel(dateKey)}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>

        {renderByView()}
    </DetailModal>
  );
}
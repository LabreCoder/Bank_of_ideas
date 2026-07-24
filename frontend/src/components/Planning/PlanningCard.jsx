const STATUS_STYLES = {
  "Not Started": "bg-gray-100 text-gray-600 border-gray-200",
  "Under Review": "bg-blue-50 text-blue-700 border-blue-200",
  "Started": "bg-purple-50 text-purple-700 border-purple-200",
  "In Development": "bg-amber-50 text-amber-700 border-amber-200",
  "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("pt-BR");
}

export default function PlanningCard({ planning, onOpen }) {
  const statusClass =
    STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200";
  const total = planning.checklist_items.length;
  const done = planning.checklist_items.filter((i) => i.is_done).length;

  return (
    <button
      onClick={() => onOpen(planning)}
      className="text-left bg-white rounded-lg border border-gray-200 p-4 flex flex-col gap-3 hover:border-accent-300 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-gray-900 leading-snug">{planning.idea.name}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {planning.status}
        </span>
      </div>

      <div className="text-xs text-gray-500 flex gap-3">
        <span>Start: {formatDate(planning.start_date) === "—" ? "--" : formatDate(planning.start_date)}</span>
        <span>End: {formatDate(planning.due_date) === "—" ? "--" : formatDate(planning.due_date)}</span>
      </div>

      {total > 0 && (
        <div className="mt-1">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Checklist</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-600"
              style={{ width: `${total ? (done / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}
    </button>
  );
}
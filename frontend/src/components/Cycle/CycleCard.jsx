const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-gray-100 text-gray-600 border-gray-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Finished": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function CycleCard({ cycle, onClick }) {
  const planningsCount = cycle.plannings?.length || 0;
  const statusClass = CYCLE_STATUS_STYLES[cycle.status] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between mb-2 gap-2">
          <h4 className="font-semibold text-gray-900 text-base">{cycle.name}</h4>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
              {cycle.status}
            </span>
            <span className="text-xs px-2.5 py-1 bg-accent-50 text-accent-700 rounded-full font-medium">
              {planningsCount} {planningsCount === 1 ? "Planning" : "Plannings"}
            </span>
          </div>
        </div>

        {cycle.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{cycle.description}</p>
        )}
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>Start: {cycle.start_date || "--"}</span>
        <span>Due: {cycle.due_date || "--"}</span>
      </div>
    </div>
  );
}
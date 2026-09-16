import { formatShortDate } from "../../utils/dateFormat";

const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-gray-100 text-gray-600 border-gray-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  Finished: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function CycleTimelineCard({ cycle, onClick }) {
  const statusClass =
    CYCLE_STATUS_STYLES[cycle.status] || "bg-gray-100 text-gray-600 border-gray-200";
  const isFinished = cycle.status === "Finished";
  const progressBarClass = isFinished ? "bg-emerald-500" : "bg-accent-600";

  return (
    <div
      onClick={() => onClick(cycle)}
      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-gray-900 text-base">{cycle.name}</h4>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
          {cycle.status}
        </span>
      </div>

      {cycle.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{cycle.description}</p>
      )}

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progresso</span>
          <span className="font-medium text-gray-700">{cycle.progress_percentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressBarClass}`}
            style={{ width: `${cycle.progress_percentage}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-500">
        <span>
          {cycle.completed_plannings} / {cycle.total_plannings} planejamentos
        </span>
        <span>
          {isFinished ? "Encerrado" : "Prazo"} {formatShortDate(cycle.due_date)}
        </span>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";
import CycleProgressRing from "./CycleProgressRing";
import { getPlanningGroup, PLANNING_GROUP_LEGEND } from "../../utils/cyclePlanningGroup";
import { formatShortDate } from "../../utils/dateFormat";
import ProgressBar from "../Default/ProgressBar";

const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-gray-100 text-gray-600 border-gray-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Finished": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export default function CycleDetailView({ cycle, onEdit, onClose }) {
  const navigate = useNavigate();
  const statusClass =
    CYCLE_STATUS_STYLES[cycle.status] || "bg-gray-100 text-gray-600 border-gray-200";

  // Fecha a modal antes de navegar — senão ela continua "por cima" da tela
  // de Planning depois da troca de rota.
  const handleOpenPlanning = (planningId) => {
    onClose();
    navigate(`/planning?planningId=${planningId}`);
  };

  const handleOpenAllPlannings = () => {
    onClose();
    navigate("/planning");
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {cycle.status}
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-accent-600 text-sm font-medium"
          >
            Edit
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{cycle.name}</h2>
      {cycle.description && <p className="text-gray-500 mb-6">{cycle.description}</p>}

      <div className="flex flex-col-3 items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center gap-2 ml-auto mr-auto">
          <CycleProgressRing percentage={cycle.progress_percentage} />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Overall Progress
          </span>
        </div>

        <div className="flex flex-col justify-center ml-auto mr-auto">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Action Plans
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {cycle.completed_plannings}
            <span className="text-sm font-normal text-gray-400">
              {" "}
              / {cycle.total_plannings} completed
            </span>
          </p>
          <div className="flex flex-col justify-center">
            <ProgressBar
              variant="large"
              label="Planos de ação"
              current={cycle.completed_plannings}
              total={cycle.total_plannings}
              percentage={cycle.progress_percentage}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 ml-auto mr-auto">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Start</p>
            <p className="text-sm font-medium text-gray-900">
              {formatShortDate(cycle.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Due Date
            </p>
            <p className="text-sm font-medium text-gray-900">{formatShortDate(cycle.due_date)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-800">Linked Plannings</h4>
          <span className="text-xs text-gray-400">
            {cycle.plannings.length} {cycle.plannings.length === 1 ? "active" : "actives"}
          </span>
        </div>

        {cycle.plannings.length === 0 ? (
          <div className="border border-dashed border-gray-200 rounded-md p-4 text-center mb-3">
            <p className="text-sm text-gray-400">No linked plannings yet.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5 mb-3">
            {cycle.plannings.map((p) => {
              const group = getPlanningGroup(p.status);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleOpenPlanning(p.id)}
                    className="w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-md px-3 py-2 text-left transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-800">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${group.dotClass}`} />
                      {p.idea?.name || `Planning #${p.id}`}
                    </span>
                    <span className="text-gray-300">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          {PLANNING_GROUP_LEGEND.map((g) => (
            <div key={g.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${g.dotClass}`} />
              <span>{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleOpenAllPlannings}
          className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Open All Plannings →
        </button>
      </div>
    </div>
  );
}

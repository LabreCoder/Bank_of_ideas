import { useNavigate } from "react-router-dom";
import CycleProgressRing from "./CycleProgressRing";
import { getPlanningGroup, PLANNING_GROUP_LEGEND } from "../../utils/cyclePlanningGroup";
import { formatShortDate } from "../../utils/dateFormat";
import ProgressBar from "../Default/ProgressBar";

const CYCLE_STATUS_STYLES = {
  "Waiting Start": "bg-ui-surface-2 text-ui-text-secondary border-ui-border",
  "In Progress": "bg-status-amber-bg text-status-amber-fg border-status-amber-border",
  "Finished": "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
};

export default function CycleDetailView({ cycle, titleId, onEdit, onClose }) {
  const navigate = useNavigate();
  const statusClass =
    CYCLE_STATUS_STYLES[cycle.status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";

  // Fecha a modal antes de navegar — senão ela continua "por cima" da tela
  // de Planning depois da troca de rota.
  const handleOpenPlanning = (planningId) => {
    onClose();
    navigate(`/planning/${planningId}`);
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
            className="text-ui-text-muted hover:text-accent-600 text-sm font-medium"
          >
            Edit
          </button>
          <button onClick={onClose} className="text-ui-text-muted hover:text-ui-text-primary text-sm">
            Close
          </button>
        </div>
      </div>

      <h2 id={titleId} className="text-2xl font-semibold text-ui-text-primary mb-2">{cycle.name}</h2>
      {cycle.description && <p className="text-ui-text-muted mb-6">{cycle.description}</p>}

      <div className="flex flex-col-3 items-center justify-between gap-4 mb-6 pb-6 border-b border-ui-border/60">
        <div className="flex flex-col items-center justify-center gap-2 ml-auto mr-auto">
          <CycleProgressRing percentage={cycle.progress_percentage} />
          <span className="text-xs font-medium text-ui-text-muted uppercase tracking-wide">
            Overall Progress
          </span>
        </div>

        <div className="flex flex-col justify-center ml-auto mr-auto">
          <p className="text-xs font-medium text-ui-text-muted uppercase tracking-wide mb-1">
            Action Plans
          </p>
          <p className="text-2xl font-semibold text-ui-text-primary">
            {cycle.completed_plannings}
            <span className="text-sm font-normal text-ui-text-muted">
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
            <p className="text-xs font-medium text-ui-text-muted uppercase tracking-wide">Start</p>
            <p className="text-sm font-medium text-ui-text-primary">
              {formatShortDate(cycle.start_date)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-ui-text-muted uppercase tracking-wide">
              Due Date
            </p>
            <p className="text-sm font-medium text-ui-text-primary">{formatShortDate(cycle.due_date)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-ui-text-primary">Linked Plannings</h4>
          <span className="text-xs text-ui-text-muted">
            {cycle.plannings.length} {cycle.plannings.length === 1 ? "active" : "actives"}
          </span>
        </div>

        {cycle.plannings.length === 0 ? (
          <div className="border border-dashed border-ui-border rounded-md p-4 text-center mb-3">
            <p className="text-sm text-ui-text-muted">No linked plannings yet.</p>
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
                    className="w-full flex items-center justify-between gap-2 bg-ui-surface-2 hover:bg-ui-surface-2 border border-ui-border/60 rounded-md px-3 py-2 text-left transition-colors"
                  >
                    <span className="flex items-center gap-2 text-sm text-ui-text-primary">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${group.dotClass}`} />
                      {p.idea?.name || `Planning #${p.id}`}
                    </span>
                    <span className="text-ui-text-muted/70">›</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-4 text-xs text-ui-text-muted">
          {PLANNING_GROUP_LEGEND.map((g) => (
            <div key={g.label} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${g.dotClass}`} />
              <span>{g.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4 border-t border-ui-border/60">
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

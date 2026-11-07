import { formatShortDate } from "../../utils/dateFormat";
export default function CycleEditView({
  titleId,
  currentCycle,
  name,
  setName,
  description,
  setDescription,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  selectedPlanningId,
  setSelectedPlanningId,
  unassignedPlannings,
  saving,
  error,
  confirmationPrompt,
  setConfirmationPrompt,
  conflictPrompt,
  setConflictPrompt,
  onUpdateInfo,
  onUpdateDueDate,
  onBindPlanning,
  onUnbindPlanning,
  onDeleteCycle,
  onDone,
  onClose,
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <button
          type="button"
          onClick={onDone}
          className="text-sm font-medium text-ui-text-muted hover:text-ui-text-primary"
        >
          ← Back to overview
        </button>
        <button onClick={onClose} className="text-ui-text-muted hover:text-ui-text-primary text-sm">
          Close
        </button>
      </div>

      <h2 id={titleId} className="text-xl font-semibold text-ui-text-primary mb-4">
        Edit cycle
      </h2>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ui-text-secondary mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ui-text-secondary mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onUpdateInfo}
            disabled={saving}
            className="bg-accent-600 hover:bg-accent-700 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
          >
            Update Cycle Details
          </button>
        </div>

        <hr className="border-ui-border/60" />

        <div>
          <label className="block text-sm font-medium text-ui-text-secondary mb-1">Cycle Due Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
            <button
              type="button"
              onClick={onUpdateDueDate}
              disabled={saving}
              className="border border-ui-border hover:bg-ui-surface-2 text-ui-text-secondary text-xs font-medium px-3 py-2 rounded-md"
            >
              Update Due Date
            </button>
          </div>

          {conflictPrompt && (
            <div className="mt-3 bg-status-amber-bg border border-status-amber-border rounded-md p-3 text-sm text-status-amber-fg">
              <p className="font-semibold mb-1">These cycle dates conflict with bound plannings:</p>
              <ul className="list-disc pl-5 mb-2 text-xs">
                {conflictPrompt.map((c) => (
                  <li key={c.planning_id}>
                    {c.idea_name}: due {formatShortDate(c.candidate_due_date)} — {c.message}
                  </li>
                ))}
              </ul>
              <p className="text-xs mb-2">
                Fix this by editing the conflicting planning's due date, or pick different
                cycle dates.
              </p>
              <button
                type="button"
                onClick={() => setConflictPrompt(null)}
                className="text-xs text-ui-text-secondary hover:underline px-2 py-1.5"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <hr className="border-ui-border/60" />

        <div>
          <h4 className="text-sm font-semibold text-ui-text-primary mb-2">Bound Plannings</h4>

          <div className="flex gap-2 mb-3">
            <select
              value={selectedPlanningId}
              onChange={(e) => setSelectedPlanningId(e.target.value)}
              className="flex-1 text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              <option value="">Select planning to bind...</option>
              {unassignedPlannings.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.idea?.name || `Planning #${p.id}`}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onBindPlanning(false)}
              disabled={!selectedPlanningId || saving}
              className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-3 py-2 rounded-md disabled:opacity-50"
            >
              Bind
            </button>
          </div>

          {confirmationPrompt && (
            <div className="mb-3 bg-status-blue-bg border border-status-blue-border rounded-md p-3 text-sm text-status-blue-fg flex flex-col gap-2">
              <p>{confirmationPrompt.message}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onBindPlanning(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-md"
                >
                  Confirm & Apply Date
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmationPrompt(null)}
                  className="text-xs text-ui-text-secondary hover:underline px-2 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {currentCycle.plannings?.length === 0 ? (
            <p className="text-xs text-ui-text-muted">No plannings bound to this cycle yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {currentCycle.plannings.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm bg-ui-surface-2 border border-ui-border/60 rounded-md px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-ui-text-primary">{p.idea?.name}</span>
                    <span className="text-xs text-ui-text-muted ml-2">
                      (Due: {p.due_date || "Not set"})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnbindPlanning(p.id)}
                    className="text-xs text-status-red-fg hover:text-status-red-fg font-medium"
                  >
                    Unbind
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-status-red-fg">{error}</p>}

        <div className="flex justify-between items-center pt-3 border-t border-ui-border/60">
          <button
            type="button"
            onClick={onDeleteCycle}
            className="text-sm text-status-red-fg hover:text-status-red-fg font-medium"
          >
            Delete Cycle
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium px-4 py-2 rounded-md bg-ui-surface-2 hover:bg-ui-border text-ui-text-secondary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

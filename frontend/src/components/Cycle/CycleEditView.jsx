export default function CycleEditView({
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
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to overview
        </button>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          Close
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
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

        <hr className="border-gray-100" />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cycle Due Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
            <button
              type="button"
              onClick={onUpdateDueDate}
              disabled={saving}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-md"
            >
              Update Due Date
            </button>
          </div>

          {conflictPrompt && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
              <p className="font-semibold mb-1">This due date conflicts with bound plannings:</p>
              <ul className="list-disc pl-5 mb-2 text-xs">
                {conflictPrompt.map((c) => (
                  <li key={c.planning_id}>
                    {c.idea_name}: due {c.candidate_due_date} — {c.message}
                  </li>
                ))}
              </ul>
              <p className="text-xs mb-2">
                Fix this by editing the conflicting planning's due date, or pick a different
                cycle due date.
              </p>
              <button
                type="button"
                onClick={() => setConflictPrompt(null)}
                className="text-xs text-gray-600 hover:underline px-2 py-1.5"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <hr className="border-gray-100" />

        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Bound Plannings</h4>

          <div className="flex gap-2 mb-3">
            <select
              value={selectedPlanningId}
              onChange={(e) => setSelectedPlanningId(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
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
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex flex-col gap-2">
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
                  className="text-xs text-gray-600 hover:underline px-2 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {currentCycle.plannings?.length === 0 ? (
            <p className="text-xs text-gray-400">No plannings bound to this cycle yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {currentCycle.plannings.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm bg-gray-50 border border-gray-100 rounded-md px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-gray-800">{p.idea?.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      (Due: {p.due_date || "Not set"})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUnbindPlanning(p.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Unbind
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onDeleteCycle}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Delete Cycle
          </button>
          <button
            type="button"
            onClick={onDone}
            className="text-sm font-medium px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

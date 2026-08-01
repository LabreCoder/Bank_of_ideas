import { useState, useEffect } from "react";
import { cycleApi } from "../../services/cycle";

export default function CycleDetailModal({
  cycle,
  availablePlannings,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [currentCycle, setCurrentCycle] = useState(cycle);
  const [name, setName] = useState(cycle.name);
  const [description, setDescription] = useState(cycle.description || "");
  const [startDate, setStartDate] = useState(cycle.start_date || "");
  const [dueDate, setDueDate] = useState(cycle.due_date || "");

  const [selectedPlanningId, setSelectedPlanningId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Estados de confirmação
  const [confirmationPrompt, setConfirmationPrompt] = useState(null);
  const [conflictPrompt, setConflictPrompt] = useState(null);

  useEffect(() => {
    setCurrentCycle(cycle);
    setName(cycle.name);
    setDescription(cycle.description || "");
    setStartDate(cycle.start_date || "");
    setDueDate(cycle.due_date || "");
  }, [cycle]);

  const handleUpdateInfo = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await cycleApi.update(currentCycle.id, {
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate,
      });
      setCurrentCycle(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to update cycle details.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateDueDate = async (force = false) => {
    setSaving(true);
    setError(null);
    setConflictPrompt(null);

    try {
      const updated = await cycleApi.updateDueDate(
        currentCycle.id,
        dueDate || null,
        force
      );
      setCurrentCycle(updated);
      onUpdated(updated);
    } catch (err) {
      if (err.status === 409 && err.detail?.conflicts) {
        setConflictPrompt(err.detail.conflicts);
      } else {
        setError(err.message || "Failed to update due date.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleBindPlanning = async (confirmCandidate = false) => {
    if (!selectedPlanningId) return;

    setSaving(true);
    setError(null);
    setConfirmationPrompt(null);

    try {
      const updated = await cycleApi.bindPlanning(
        currentCycle.id,
        selectedPlanningId,
        confirmCandidate
      );
      setCurrentCycle(updated);
      onUpdated(updated);
      setSelectedPlanningId("");
    } catch (err) {
      if (err.status === 422 && err.detail?.requires_confirmation) {
        setConfirmationPrompt(err.detail);
      } else {
        setError(err.message || "Failed to bind planning.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUnbindPlanning = async (planningId) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await cycleApi.unbindPlanning(currentCycle.id, planningId);
      setCurrentCycle(updated);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "Failed to unbind planning.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCycle = async () => {
    if (!confirm("Remove this cycle? Bound plannings will remain intact.")) return;
    setSaving(true);
    try {
      await cycleApi.delete(currentCycle.id);
      onDeleted(currentCycle.id);
    } catch (err) {
      setError(err.message || "Failed to delete cycle.");
      setSaving(false);
    }
  };

  // Filtra plannings que já estão vinculados a este ciclo
  const boundIds = new Set((currentCycle.plannings || []).map((p) => p.id));
  const unassignedPlannings = availablePlannings.filter((p) => !boundIds.has(p.id));

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-lg border border-gray-200 w-full max-w-[80vw] p-8 max-h-[90vh] overflow-y-auto"
        style={{ left: "12%", right: "14%", position: "fixed" }}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{currentCycle.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-5">
          {/* Informações Principais */}
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
              onClick={handleUpdateInfo}
              disabled={saving}
              className="bg-accent-600 hover:bg-accent-700 text-white text-xs font-medium px-3 py-1.5 rounded-md disabled:opacity-50"
            >
              Update Cycle Details
            </button>
          </div>

          <hr className="border-gray-100" />

          {/* Gerenciamento de Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Due Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <button
                type="button"
                onClick={() => handleUpdateDueDate(false)}
                disabled={saving}
                className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-2 rounded-md"
              >
                Update Due Date
              </button>
            </div>

            {/* Modal/Aviso de Conflitos na Edição de Data */}
            {conflictPrompt && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800">
                <p className="font-semibold mb-1">Date Conflict Detected:</p>
                <ul className="list-disc pl-5 mb-2 text-xs">
                  {conflictPrompt.map((c) => (
                    <li key={c.planning_id}>
                      {c.idea_name}: candidate date ({c.candidate_due_date}) falls outside cycle.
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateDueDate(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3 py-1.5 rounded-md"
                  >
                    Force Update Anyway
                  </button>
                  <button
                    type="button"
                    onClick={() => setConflictPrompt(null)}
                    className="text-xs text-gray-600 hover:underline px-2 py-1.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Seção de Vinculação de Plannings */}
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
                onClick={() => handleBindPlanning(false)}
                disabled={!selectedPlanningId || saving}
                className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-3 py-2 rounded-md disabled:opacity-50"
              >
                Bind
              </button>
            </div>

            {/* Aviso de Confirmação para Fallback de Data */}
            {confirmationPrompt && (
              <div className="mb-3 bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex flex-col gap-2">
                <p>{confirmationPrompt.message}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleBindPlanning(true)}
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
                      onClick={() => handleUnbindPlanning(p.id)}
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
              onClick={handleDeleteCycle}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Delete Cycle
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
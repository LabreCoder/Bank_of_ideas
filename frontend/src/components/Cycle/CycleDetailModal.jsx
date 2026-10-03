import { useState, useEffect } from "react";
import { cycleApi } from "../../services/cycle";
import DetailModal from "../Default/DetailModal";
import CycleDetailView from "./CycleDetailView";
import CycleEditView from "./CycleEditView";

export default function CycleDetailModal({
  cycle,
  availablePlannings,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [mode, setMode] = useState("view"); // "view" | "edit"
  const [currentCycle, setCurrentCycle] = useState(cycle);
  const [name, setName] = useState(cycle.name);
  const [description, setDescription] = useState(cycle.description || "");
  const [startDate, setStartDate] = useState(cycle.start_date || "");
  const [dueDate, setDueDate] = useState(cycle.due_date || "");

  const [selectedPlanningId, setSelectedPlanningId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

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

  const handleUpdateDueDate = async () => {
    setSaving(true);
    setError(null);
    setConflictPrompt(null);

    try {
      const updated = await cycleApi.updateDueDate(currentCycle.id, dueDate || null);
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

  const boundIds = new Set((currentCycle.plannings || []).map((p) => p.id));
  const unassignedPlannings = availablePlannings.filter((p) => !boundIds.has(p.id));

  return (
    <DetailModal onClose={onClose} size="lg">
      {mode === "view" ? (
        <CycleDetailView cycle={currentCycle} onEdit={() => setMode("edit")} onClose={onClose} />
      ) : (
        <CycleEditView
          currentCycle={currentCycle}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          startDate={startDate}
          setStartDate={setStartDate}
          dueDate={dueDate}
          setDueDate={setDueDate}
          selectedPlanningId={selectedPlanningId}
          setSelectedPlanningId={setSelectedPlanningId}
          unassignedPlannings={unassignedPlannings}
          saving={saving}
          error={error}
          confirmationPrompt={confirmationPrompt}
          setConfirmationPrompt={setConfirmationPrompt}
          conflictPrompt={conflictPrompt}
          setConflictPrompt={setConflictPrompt}
          onUpdateInfo={handleUpdateInfo}
          onUpdateDueDate={handleUpdateDueDate}
          onBindPlanning={handleBindPlanning}
          onUnbindPlanning={handleUnbindPlanning}
          onDeleteCycle={handleDeleteCycle}
          onDone={() => setMode("view")}
          onClose={onClose}
        />
      )}
    </DetailModal>
  );
}
import { useState, useEffect, useId } from "react";
import { cycleApi } from "../../services/cycle";
import DetailModal from "../Default/DetailModal";
import ConfirmDialog from "../Default/ConfirmDialog";
import { TERMINAL_PLANNING_STATUSES } from "../../utils/planningStatus";
import CycleDetailView from "./CycleDetailView";
import CycleEditView from "./CycleEditView";

export default function CycleDetailModal({
  cycle,
  availablePlannings,
  planningCycleNames,
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // Ação (fechar / voltar à visão geral) aguardando "descartar alterações?".
  const [pendingDiscard, setPendingDiscard] = useState(null);
  const [savedRecently, setSavedRecently] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setCurrentCycle(cycle);
    setName(cycle.name);
    setDescription(cycle.description || "");
    setStartDate(cycle.start_date || "");
    setDueDate(cycle.due_date || "");
  }, [cycle]);

  // D09: um único "Save" envia nome, descrição, início e fim. O backend
  // valida tudo junto e não salva nada se houver conflito (409) — antes eram
  // dois botões e editar nome + data e clicar "Done" perdia tudo sem aviso.
  const handleSave = async () => {
    if (!startDate) {
      setError("Start date is required.");
      return;
    }
    setSaving(true);
    setError(null);
    setConflictPrompt(null);
    try {
      const updated = await cycleApi.update(currentCycle.id, {
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate,
        due_date: dueDate || null,
      });
      setCurrentCycle(updated);
      onUpdated(updated);
      setSavedRecently(true);
    } catch (err) {
      // 409: as novas datas deixam plannings vinculados fora do período.
      if (err.status === 409 && err.detail?.conflicts) {
        setConflictPrompt(err.detail.conflicts);
      } else {
        setError(err.message || "Failed to update the cycle.");
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
    setSaving(true);
    try {
      await cycleApi.delete(currentCycle.id);
      setConfirmingDelete(false);
      onDeleted(currentCycle.id);
    } catch (err) {
      setError(err.message || "Failed to delete cycle.");
      setConfirmingDelete(false);
      setSaving(false);
    }
  };

  // D03: alterações não salvas no modo edição pedem confirmação antes de
  // fechar o modal ou voltar para a visão geral (Esc/clique fora via DetailModal).
  const editDirty =
    mode === "edit" &&
    (name.trim() !== currentCycle.name ||
      description.trim() !== (currentCycle.description || "") ||
      startDate !== (currentCycle.start_date || "") ||
      (dueDate || "") !== (currentCycle.due_date || ""));

  const resetEditFields = () => {
    setName(currentCycle.name);
    setDescription(currentCycle.description || "");
    setStartDate(currentCycle.start_date || "");
    setDueDate(currentCycle.due_date || "");
    setConflictPrompt(null);
    setConfirmationPrompt(null);
    setError(null);
  };

  const guard = (action) => () => {
    if (editDirty) setPendingDiscard(() => action);
    else action();
  };

  const backToOverview = () => {
    resetEditFields();
    setSavedRecently(false);
    setMode("view");
  };

  const boundIds = new Set((currentCycle.plannings || []).map((p) => p.id));
  // planningId -> nomes dos OUTROS ciclos em que o planning já está.
  const otherCycleNames = new Map(
    [...(planningCycleNames ?? new Map())].map(([planningId, cycles]) => [
      planningId,
      cycles.filter((c) => c.id !== currentCycle.id).map((c) => c.name),
    ])
  );

  // D09: plannings concluídos/cancelados não aparecem na lista de vínculo.
  const unassignedPlannings = availablePlannings.filter(
    (p) => !boundIds.has(p.id) && !TERMINAL_PLANNING_STATUSES.has(p.status)
  );

  return (
    <DetailModal onClose={onClose} size="lg" labelledBy={titleId} dirty={editDirty}>
      {mode === "view" ? (
        <CycleDetailView
          cycle={currentCycle}
          titleId={titleId}
          onEdit={() => setMode("edit")}
          onClose={onClose}
        />
      ) : (
        <CycleEditView
          titleId={titleId}
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
          planningCycleNames={otherCycleNames}
          saving={saving}
          error={error}
          confirmationPrompt={confirmationPrompt}
          setConfirmationPrompt={setConfirmationPrompt}
          conflictPrompt={conflictPrompt}
          setConflictPrompt={setConflictPrompt}
          dirty={editDirty}
          savedRecently={savedRecently && !editDirty}
          onSave={handleSave}
          onBindPlanning={handleBindPlanning}
          onUnbindPlanning={handleUnbindPlanning}
          onDeleteCycle={() => setConfirmingDelete(true)}
          onDone={guard(backToOverview)}
          onClose={guard(onClose)}
        />
      )}

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this cycle?"
        message={
          <>
            The cycle <strong>{currentCycle.name}</strong> will be deleted. Its bound plannings
            will <strong>not</strong> be deleted — they just leave this cycle. This cannot be undone.
          </>
        }
        confirmLabel="Delete cycle"
        busy={saving}
        onConfirm={handleDeleteCycle}
        onCancel={() => setConfirmingDelete(false)}
      />
      <ConfirmDialog
        open={Boolean(pendingDiscard)}
        title="Discard changes?"
        message="Your unsaved changes to this cycle will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          const action = pendingDiscard;
          setPendingDiscard(null);
          action();
        }}
        onCancel={() => setPendingDiscard(null)}
      />
    </DetailModal>
  );
}
import { formatShortDate } from "../../utils/dateFormat";
import { useState, useEffect, useRef } from "react";
import { planningApi } from "../../services/planning";
import { checklistApi } from "../../services/checklist";
import { useUnsavedChangesGuard } from "../../hooks/useUnsavedChangesGuard";
import { PLANNING_STATUS_OPTIONS, PLANNING_STATUS_STYLES } from "../../utils/planningStatus";
import ProgressBar from "../Default/ProgressBar";
import ConfirmDialog from "../Default/ConfirmDialog";

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

// Itens criados no cliente usam id string ("tmp-N") até o servidor devolver o id real.
const isTempId = (id) => typeof id === "string";

// D01: o checklist grava na hora (como no detalhe da ideia), com atualização
// otimista e reversão em caso de erro. Só os campos do planning (status,
// datas, detalhes) dependem do botão Save.
export default function PlanningDetailPanel({
  planning,
  backLabel = "Planning",
  onClose,
  onUpdated,
  onDeleted,
}) {
  const [checklistItems, setChecklistItems] = useState(planning.checklist_items || []);
  const tempIdCounter = useRef(0);
  // Só a resposta da operação mais recente substitui a lista local; respostas
  // atrasadas de cliques anteriores não "desfazem" um clique mais novo.
  const checklistOpSeq = useRef(0);

  const [status, setStatus] = useState(planning.status);
  const [startDate, setStartDate] = useState(planning.start_date || "");
  const [dueDate, setDueDate] = useState(planning.due_date || "");
  const [details, setDetails] = useState(planning.details || "");

  const [newItem, setNewItem] = useState({ description: "", due_date: "" });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [editingItemId, setEditingItemId] = useState(null);
  const [editItem, setEditItem] = useState({ description: "", due_date: "" });

  useEffect(() => {
    setChecklistItems(planning.checklist_items || []);
    setStatus(planning.status);
    setStartDate(planning.start_date || "");
    setDueDate(planning.due_date || "");
    setDetails(planning.details || "");
  }, [planning.id]);

  const nextTempId = () => {
    tempIdCounter.current += 1;
    return `tmp-${tempIdCounter.current}`;
  };

  // Campos do planning diferentes do que está salvo (o checklist não entra:
  // ele já é gravado a cada ação). Texto digitado no "New item" e não
  // adicionado também conta, para não ser perdido sem aviso.
  const fieldsDirty =
    status !== planning.status ||
    (details.trim() || null) !== (planning.details || null) ||
    (startDate || null) !== (planning.start_date || null) ||
    (dueDate || null) !== (planning.due_date || null);
  const pendingNewItem = newItem.description.trim() !== "";
  const dirty = fieldsDirty || pendingNewItem;

  // Voltar/fechar navegam (D02); a confirmação com alterações pendentes vem do guard.
  const { allowNextNavigation, leaveDialog } = useUnsavedChangesGuard(dirty);
  const handleClose = onClose;

  // Executa uma ação do checklist: aplica o estado otimista, chama a API e
  // usa a resposta (planning completo) como verdade; em erro, volta ao anterior.
  const runChecklistOp = async (optimisticUpdate, request, errorMessage) => {
    const previous = checklistItems;
    const seq = ++checklistOpSeq.current;
    setError(null);
    setChecklistItems(optimisticUpdate(previous));
    try {
      const updated = await request();
      if (seq === checklistOpSeq.current) setChecklistItems(updated.checklist_items || []);
      onUpdated(updated);
      return true;
    } catch (err) {
      if (seq === checklistOpSeq.current) setChecklistItems(previous);
      setError(err.message || errorMessage);
      return false;
    }
  };

  const handleSave = async () => {
    setError(null);
    setSavedSuccess(false);
    if (!dirty) return;

    setSaving(true);
    try {
      if (fieldsDirty) {
        const updated = await planningApi.update(planning.id, {
          status,
          start_date: startDate || null,
          due_date: dueDate || null,
          details: details.trim() || null,
        });
        onUpdated(updated);
      }
      // Item digitado mas não adicionado com "Add" também é gravado no Save.
      if (pendingNewItem) {
        const ok = await handleAddItem();
        if (!ok) return;
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "It was not possible to update the plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    const description = newItem.description.trim();
    if (!description) return false;
    const due_date = newItem.due_date || null;
    const tempItem = {
      id: nextTempId(),
      description,
      due_date,
      is_done: false,
      position: checklistItems.length,
    };

    setNewItem({ description: "", due_date: "" });
    const ok = await runChecklistOp(
      (items) => [...items, tempItem],
      () => checklistApi.addChecklistItem(planning.id, { description, due_date }),
      "It was not possible to add the item."
    );
    // Em erro, devolve o texto ao campo para o usuário não perder o que digitou.
    if (!ok) setNewItem({ description, due_date: due_date || "" });
    return ok;
  };

  const handleToggleItem = (itemId) => {
    if (isTempId(itemId)) return;
    runChecklistOp(
      (items) => items.map((item) => (item.id === itemId ? { ...item, is_done: !item.is_done } : item)),
      () => checklistApi.toggleChecklistItem(planning.id, itemId),
      "It was not possible to update the item."
    );
  };

  // Exclusões passam por um ConfirmDialog (D03): { type: "item", item } | { type: "planning" }.
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDeleteItem = (itemId) => {
    if (isTempId(itemId)) return;
    runChecklistOp(
      (items) => items.filter((item) => item.id !== itemId),
      () => checklistApi.deleteChecklistItem(planning.id, itemId),
      "It was not possible to remove the item."
    );
  };

  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditItem({ description: item.description, due_date: item.due_date || "" });
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditItem({ description: "", due_date: "" });
  };

  const handleSaveEditItem = (itemId) => {
    const description = editItem.description.trim();
    if (!description || isTempId(itemId)) return;
    const due_date = editItem.due_date || null;

    cancelEditingItem();
    runChecklistOp(
      (items) => items.map((item) => (item.id === itemId ? { ...item, description, due_date } : item)),
      () => checklistApi.updateChecklistItem(planning.id, itemId, { description, due_date }),
      "It was not possible to update the item."
    );
  };

  const handleDeletePlanning = async () => {
    setSaving(true);
    setError(null);
    try {
      await planningApi.delete(planning.id);
      // O planning não existe mais: alterações pendentes não fazem sentido.
      allowNextNavigation();
      setPendingDelete(null);
      onDeleted(planning.id);
    } catch (err) {
      setError(err.message || "It was not possible to remove the plan.");
      setPendingDelete(null);
      setSaving(false);
    }
  };

  const confirmPendingDelete = () => {
    if (pendingDelete?.type === "planning") {
      handleDeletePlanning();
    } else if (pendingDelete?.type === "item") {
      handleDeleteItem(pendingDelete.item.id);
      setPendingDelete(null);
    }
  };

  const total = checklistItems.length;
  const done = checklistItems.filter((i) => i.is_done).length;
  const statusClass =
    PLANNING_STATUS_STYLES[status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";

  return (
    <div>
      <button
        type="button"
        onClick={handleClose}
        className="text-sm text-ui-text-muted hover:text-ui-text-primary mb-2"
      >
        ← {backLabel}
      </button>

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold text-ui-text-primary">{planning.idea.name}</h1>
        <button
          type="button"
          onClick={handleClose}
          className="text-ui-text-muted hover:text-ui-text-primary text-sm"
        >
          Close
        </button>
      </div>
      <p className="text-ui-text-muted mb-6">Manage the plan, dates and checklist in one place.</p>

      <div className="bg-ui-surface border border-ui-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* ---- Planning ---- */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-ui-text-primary">Planning</h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}
              >
                {status}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-ui-text-secondary mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                >
                  {PLANNING_STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary mb-1">Start</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ui-text-secondary mb-1">Due</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text-secondary mb-1">Details</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={6}
                  className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
            </div>
          </div>

          {/* ---- Checklist ---- */}
          <div className="border-t border-ui-border/60 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-ui-text-primary">Checklist</h3>
              <span className="text-xs text-ui-text-muted">Saved automatically</span>
            </div>

            {total > 0 && (
              <div className="mb-4">
                <ProgressBar current={done} total={total} />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-2 items-end">
              <div className="flex-1 min-w-[12rem]">
                <label className="block text-xs font-medium text-ui-text-muted mb-1">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, description: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  placeholder="New item..."
                  className="w-full text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ui-text-muted mb-1">Due</label>
                <input
                  type="date"
                  value={newItem.due_date}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, due_date: e.target.value }))}
                  className="text-sm border border-ui-border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm font-medium px-3 py-2 rounded-md border border-ui-border hover:bg-ui-surface-2 shrink-0"
              >
                Add
              </button>
            </div>

            {checklistItems.length === 0 ? (
              <p className="text-xs text-ui-text-muted">No items yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {checklistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm bg-ui-surface-2 rounded-md px-3 py-1.5"
                  >
                    {editingItemId === item.id ? (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        <input
                          type="text"
                          value={editItem.description}
                          onChange={(e) =>
                            setEditItem((prev) => ({ ...prev, description: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEditItem(item.id);
                            } else if (e.key === "Escape") {
                              cancelEditingItem();
                            }
                          }}
                          autoFocus
                          className="flex-1 min-w-[10rem] text-sm border border-ui-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-600"
                        />
                        <input
                          type="date"
                          value={editItem.due_date}
                          onChange={(e) =>
                            setEditItem((prev) => ({ ...prev, due_date: e.target.value }))
                          }
                          className="text-sm border border-ui-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-600"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditItem(item.id)}
                          disabled={!editItem.description.trim()}
                          className="text-xs font-medium bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white px-2 py-1 rounded shrink-0"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingItem}
                          className="text-xs font-medium text-ui-text-muted hover:text-ui-text-primary px-1 py-1 shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="checkbox"
                          checked={item.is_done}
                          onChange={() => handleToggleItem(item.id)}
                          disabled={isTempId(item.id)}
                          className="accent-accent-600"
                        />
                        <span className={`flex-1 min-w-0 break-words ${item.is_done ? "line-through text-ui-text-muted" : ""}`}>
                          {item.description}
                        </span>
                        {item.due_date && (
                          <span className="text-xs text-ui-text-muted">{formatShortDate(item.due_date)}</span>
                        )}
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingItem(item)}
                            title="Edit"
                            className="p-1 text-ui-text-muted hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete({ type: "item", item })}
                            title="Remove"
                            className="p-1 text-ui-text-muted hover:text-status-red-fg hover:bg-status-red-bg rounded transition-colors"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-status-red-fg mt-6">
            {error}
          </p>
        )}
        {savedSuccess && !dirty && (
          <p role="status" className="text-sm text-status-emerald-fg mt-6">
            Changes saved successfully!
          </p>
        )}

        <div className="flex justify-between items-center pt-6 mt-6 border-t border-ui-border/60">
          <button
            type="button"
            onClick={() => setPendingDelete({ type: "planning" })}
            disabled={saving}
            className="text-sm font-medium text-status-red-fg hover:text-status-red-fg disabled:opacity-50"
          >
            Delete planning
          </button>
          <div className="flex items-center gap-3">
            {dirty && (
              <span role="status" className="text-xs font-medium text-status-amber-fg">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete?.type === "planning"}
        title="Delete this planning?"
        message={
          <>
            The planning for <strong>{planning.idea.name}</strong> and its checklist will be
            deleted. The idea will become free again and the planning will leave any cycle it
            belongs to. This cannot be undone.
          </>
        }
        confirmLabel="Delete planning"
        busy={saving}
        onConfirm={confirmPendingDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmDialog
        open={pendingDelete?.type === "item"}
        title="Remove checklist item?"
        message={
          <>
            <strong>{pendingDelete?.item?.description}</strong> will be removed from the
            checklist. This cannot be undone.
          </>
        }
        confirmLabel="Remove item"
        onConfirm={confirmPendingDelete}
        onCancel={() => setPendingDelete(null)}
      />
      <ConfirmDialog
        open={leaveDialog.open}
        title="Leave without saving?"
        message="Your changes to status, dates or details (and any item typed but not added) will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={leaveDialog.onConfirm}
        onCancel={leaveDialog.onCancel}
      />
    </div>
  );
}

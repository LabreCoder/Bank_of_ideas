import { useState, useEffect } from "react";
import { planningApi } from "../../services/planning";
import { STATUS_OPTIONS } from "../../pages/Planning";


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

export default function PlanningDetailModal({ planning, onClose, onUpdated, onDeleted }) {
  // Estado local do checklist (rascunho)
  const [checklistItems, setChecklistItems] = useState(planning.checklist_items || []);

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

  const handleSave = async () => {
    setError(null);
    setSavedSuccess(false);

    if (!hasChanges()) {
      setError("No changes detected to save.");
      return;
    }

    setSaving(true);
    try {
      const patch = {
        status,
        start_date: startDate || null,
        due_date: dueDate || null,
        details: details.trim() || null,
        checklist_items: checklistItems,
      };

      const updated = await planningApi.update(planning.id, patch);
      onUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.message || "It was not possible to update the plan.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.description.trim()) return;

    const itemToAdd = {
      id: Date.now(), // ID temporário local
      description: newItem.description.trim(),
      due_date: newItem.due_date || null,
      is_done: false,
    };

    setChecklistItems((prev) => [...prev, itemToAdd]);
    setNewItem({ description: "", due_date: "" });
  };

  const handleToggleItem = (itemId) => {
    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_done: !item.is_done } : item
      )
    );
  };

  const handleDeleteItem = (itemId) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const startEditingItem = (item) => {
    setEditingItemId(item.id);
    setEditItem({
      description: item.description,
      due_date: item.due_date || "",
    });
  };

  const cancelEditingItem = () => {
    setEditingItemId(null);
    setEditItem({ description: "", due_date: "" });
  };

  const handleSaveEditItem = (itemId) => {
    if (!editItem.description.trim()) return;

    setChecklistItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              description: editItem.description.trim(),
              due_date: editItem.due_date ? editItem.due_date : null,
            }
          : item
      )
    );
    cancelEditingItem();
  };

  const handleDeletePlanning = async () => {
    if (!confirm("Remove this plan? The idea will become available again.")) return;
    setSaving(true);
    setError(null);
    try {
      await planningApi.delete(planning.id);
      onDeleted(planning.id);
    } catch (err) {
      setError(err.message || "It was not possible to remove the plan.");
      setSaving(false);
    }
  };

  const hasChanges = () => {
    const currentDetails = details.trim() || null;
    const originalDetails = planning.details || null;
    const currentStart = startDate || null;
    const originalStart = planning.start_date || null;
    const currentDue = dueDate || null;
    const originalDue = planning.due_date || null;

    // Compara campos simples
    if (
      status !== planning.status ||
      currentDetails !== originalDetails ||
      currentStart !== originalStart ||
      currentDue !== originalDue
    ) {
      return true;
    }

    // Compara itens do checklist
    return JSON.stringify(checklistItems) !== JSON.stringify(planning.checklist_items || []);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-lg border border-gray-200 w-full max-w-[84vw] p-8 max-h-[90vh] overflow-y-auto"
        style={{ left: "12%", right: "14%", position: "fixed" }}
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">{planning.idea.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>

            {/* Seção para adicionar novo item com Rótulos/Titulos */}
            <div className="flex gap-2 mb-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
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
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Due</label>
                <input
                  type="date"
                  value={newItem.due_date}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, due_date: e.target.value }))}
                  className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm font-medium px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 shrink-0"
              >
                Add
              </button>
            </div>

            {checklistItems.length === 0 ? (
              <p className="text-xs text-gray-400">No items yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {checklistItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-3 py-1.5"
                  >
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-2 w-full">
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
                          className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-600"
                        />
                        <input
                          type="date"
                          value={editItem.due_date}
                          onChange={(e) =>
                            setEditItem((prev) => ({ ...prev, due_date: e.target.value }))
                          }
                          className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-accent-600"
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
                          className="text-xs font-medium text-gray-500 hover:text-gray-700 px-1 py-1 shrink-0"
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
                          className="accent-accent-600"
                        />
                        <span className={`flex-1 ${item.is_done ? "line-through text-gray-400" : ""}`}>
                          {item.description}
                        </span>
                        {item.due_date && (
                          <span className="text-xs text-gray-400">({item.due_date})</span>
                        )}
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditingItem(item)}
                            title="Edit"
                            className="p-1 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded transition-colors"
                          >
                            <PencilIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Remove"
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
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

          {error && <p className="text-sm text-red-600">{error}</p>}
          {savedSuccess && <p className="text-sm text-green-600">Changes saved successfully!</p>}

          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDeletePlanning}
              disabled={saving}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Delete planning
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
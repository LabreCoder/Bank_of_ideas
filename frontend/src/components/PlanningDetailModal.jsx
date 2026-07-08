import { useState } from "react";
import { planningApi } from "../services/planning";

const STATUS_OPTIONS = ["Not Started", "In Development", "Under Review", "Completed"];

export default function PlanningDetailModal({ planning, onClose, onUpdated, onDeleted }) {
  const [status, setStatus] = useState(planning.status);
  const [startDate, setStartDate] = useState(planning.start_date || "");
  const [dueDate, setDueDate] = useState(planning.due_date || "");
  const [details, setDetails] = useState(planning.details || "");
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const saveFields = async (patch) => {
    setError(null);
    try {
      const updated = await planningApi.update(planning.id, patch);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the plan.");
    }
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    saveFields({ status: value });
  };

  const handleDatesBlur = () => {
    saveFields({ start_date: startDate || null, due_date: dueDate || null });
  };

  const handleDetailsBlur = () => {
    saveFields({ details: details.trim() || null });
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    setError(null);
    try {
      const updated = await planningApi.addChecklistItem(planning.id, newItem.trim());
      onUpdated(updated);
      setNewItem("");
    } catch (err) {
      setError(err.message || "It was not possible to add the item.");
    }
  };

  const handleToggleItem = async (itemId) => {
    setError(null);
    try {
      const updated = await planningApi.toggleChecklistItem(planning.id, itemId);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the item.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    setError(null);
    try {
      const updated = await planningApi.deleteChecklistItem(planning.id, itemId);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to remove the item.");
    }
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

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => handleStatusChange(e.target.value)}
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
                onBlur={handleDatesBlur}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onBlur={handleDatesBlur}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              onBlur={handleDetailsBlur}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder="New item..."
                className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <button
                type="button"
                onClick={handleAddItem}
                className="text-sm font-medium px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                Add
              </button>
            </div>

            {planning.checklist_items.length === 0 ? (
              <p className="text-xs text-gray-400">No items yet.</p>
            ) : (
              <ul className="flex flex-col gap-1">
                {planning.checklist_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm bg-gray-50 rounded-md px-3 py-1.5"
                  >
                    <input
                      type="checkbox"
                      checked={item.is_done}
                      onChange={() => handleToggleItem(item.id)}
                      className="accent-accent-600"
                    />
                    <span className={`flex-1 ${item.is_done ? "line-through text-gray-400" : ""}`}>
                      {item.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-400 hover:text-red-600 text-xs"
                    >
                      remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-between pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDeletePlanning}
              disabled={saving}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Delete planning
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
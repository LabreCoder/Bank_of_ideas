import { useState } from "react";
import { planningApi } from "../../services/planning";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

const IDEA_STATUS_STYLES = {
  Livre: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Em Planejamento": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function IdeaDetailModal({ idea, planning, onClose, onPlanningUpdated }) {
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState(null);

  const handleAddItem = async () => {
    if (!newItem.trim() || !planning) return;
    setError(null);
    try {
      const updated = await planningApi.addChecklistItem(planning.id, newItem.trim());
      onPlanningUpdated(updated);
      setNewItem("");
    } catch (err) {
      setError(err.message || "It was not possible to add the item.");
    }
  };

  const handleToggleItem = async (itemId) => {
    if (!planning) return;
    setError(null);
    try {
      const updated = await planningApi.toggleChecklistItem(planning.id, itemId);
      onPlanningUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the item.");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!planning) return;
    setError(null);
    try {
      const updated = await planningApi.deleteChecklistItem(planning.id, itemId);
      onPlanningUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to remove the item.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="text-lg font-semibold">{idea.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
            Close
          </button>
        </div>

        {/* ---- Ideia ---- */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                IDEA_STATUS_STYLES[idea.execution_status] || "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {idea.execution_status}
            </span>
            {idea.category && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                {idea.category.name}
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
              {idea.owner.name}
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Idea Description
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {idea.description || "--"}
            </p>
          </div>
        </div>

        {/* ---- Planning ---- */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Planning
          </p>

          {!planning ? (
            <p className="text-sm text-gray-400">
              This idea does not have a planning yet. Create one on the Planning page.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                    PLANNING_STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {planning.status}
                </span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Planning Description
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {planning.details || "--"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Checklist
                </p>

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
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
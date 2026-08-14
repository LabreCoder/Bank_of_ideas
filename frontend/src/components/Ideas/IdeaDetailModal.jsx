import { useEffect, useState } from "react";
import { ideasApi } from "../../services/ideas";
import { planningApi } from "../../services/planning";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";
import DetailModal from "../Default/DetailModal";

const IDEA_STATUS_STYLES = {
  Free: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "In Planning": "bg-amber-50 text-amber-700 border-amber-200",
};

export default function IdeaDetailModal({
  idea,
  planning,
  categories,
  owners,
  onClose,
  onUpdated,
  onToggleActive,
  onPlanningUpdated,
}) {
  const [name, setName] = useState(idea.name);
  const [description, setDescription] = useState(idea.description || "");
  const [categoryId, setCategoryId] = useState(idea.category?.id ?? "");
  const [ownerId, setOwnerId] = useState(idea.owner.id);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState(null);

  // Re-sincroniza os campos locais sempre que `idea` mudar (depois de um
  // save bem-sucedido, ou ao reabrir com outra idea).
  useEffect(() => {
    setName(idea.name);
    setDescription(idea.description || "");
    setCategoryId(idea.category?.id ?? "");
    setOwnerId(idea.owner.id);
  }, [idea]);

  const saveField = async (patch) => {
    setError(null);
    try {
      const updated = await ideasApi.update(idea.id, patch);
      onUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the idea.");
    }
  };

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== idea.name) saveField({ name: trimmed });
  };

  const handleDescriptionBlur = () => {
    const trimmed = description.trim() || null;
    if (trimmed !== (idea.description || null)) saveField({ description: trimmed });
  };

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    saveField({ category_id: value ? Number(value) : null });
  };

  const handleOwnerChange = (value) => {
    setOwnerId(value);
    saveField({ owner_id: Number(value) });
  };

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

  const statusClass =
    IDEA_STATUS_STYLES[idea.execution_status] || "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <DetailModal onClose={onClose} size="xl">
      <div className="flex items-start justify-between gap-2 mb-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusClass}`}>
          {idea.execution_status}
        </span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          Close
        </button>
      </div>

      {/* ---- Editable idea fields ---- */}
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="w-full text-sm font-medium border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={handleDescriptionBlur}
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select
              value={ownerId}
              onChange={(e) => handleOwnerChange(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ---- Planning (read-only details + interactive checklist) ---- */}
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Planning</p>

        {!planning ? (
          <p className="text-sm text-gray-400">
            This idea does not have a planning yet. Create one on the Planning page.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            <span
              className={`self-start text-xs font-medium px-2 py-0.5 rounded-full border ${
                PLANNING_STATUS_STYLES[planning.status] || "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {planning.status}
            </span>

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
                      {/*<button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>*/} 
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={() => onToggleActive(idea)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          {idea.is_active ? "Deactivate" : "Activate"}
        </button>
        {/*<button
          type="button"
          onClick={onClose}
          className="text-sm font-medium px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Close
        </button>*/}
      </div>
    </DetailModal>
  );
}
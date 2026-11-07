import { useEffect, useState } from "react";
import { ideasApi } from "../../services/ideas";
import { checklistApi } from "../../services/checklist";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

const IDEA_STATUS_STYLES = {
  Free: "bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border",
  "In Planning": "bg-status-indigo-bg text-status-indigo-fg border-status-indigo-border",
};

export default function IdeaDetail({
  idea,
  planning,
  categories,
  owners,
  backLabel = "Ideas",
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

  const statusClass = IDEA_STATUS_STYLES[idea.execution_status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border";

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
      const updated = await checklistApi.addChecklistItem(planning.id, newItem.trim());
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
      const updated = await checklistApi.toggleChecklistItem(planning.id, itemId);
      onPlanningUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the item.");
    }
  };

  const completedCount = planning?.checklist_items.filter(i => i.is_done).length || 0;
  const totalCount = planning?.checklist_items.length || 0;

  return (
    <div className="animate-fade-in w-full pb-10">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 text-sm text-ui-text-muted mb-6">
        <button onClick={onClose} className="hover:text-ui-text-primary">&larr; {backLabel}</button>
        <span>/</span>
        <span className="text-ui-text-primary">{idea.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ui-text-primary">{idea.name}</h1>
          <p className="text-ui-text-muted mt-1">Idea details and planning, together in one place.</p>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-ui-text-secondary hover:text-ui-text-primary flex items-center gap-2">
          ✕ Close
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-ui-surface border border-ui-border rounded-xl p-8 flex flex-col md:flex-row gap-12">
        
        {/* Left Column: Idea Details */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-ui-text-primary">Idea</h2>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusClass}`}>
              {idea.execution_status}
            </span>
          </div>

          <div className="flex flex-col gap-4 flex-grow">
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                rows={8}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Owner</label>
              <select
                value={ownerId}
                onChange={(e) => handleOwnerChange(e.target.value)}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button onClick={() => onToggleActive(idea)} className="text-sm font-medium text-status-red-fg hover:text-status-red-fg">
              {idea.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-px bg-ui-surface-2 -my-8"></div>

        {/* Right Column: Planning */}
        <div className="flex-1 flex flex-col">
          {!planning ? (
            <p className="text-sm text-ui-text-muted mt-2">This idea does not have a planning yet.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-ui-text-primary">Planning</h2>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${PLANNING_STATUS_STYLES[planning.status] || "bg-ui-surface-2 text-ui-text-secondary border-ui-border"}`}>
                  {planning.status}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-medium text-ui-text-muted uppercase tracking-wide mb-2">Planning Description</p>
                <p className="text-sm text-ui-text-secondary whitespace-pre-wrap">{planning.details || "--"}</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-ui-text-primary">Checklist</h3>
                  <span className="text-xs font-medium text-ui-text-muted">{completedCount}/{totalCount}</span>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    placeholder="New item..."
                    className="flex-1 text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600"
                  />
                  <button onClick={handleAddItem} className="text-sm font-medium px-4 py-2 rounded-md border border-ui-border hover:bg-ui-surface-2">
                    Add
                  </button>
                </div>

                <ul className="flex flex-col gap-2">
                  {planning.checklist_items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm border border-ui-border/60 rounded-md px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.is_done}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-4 h-4 rounded border-ui-border text-accent-600 focus:ring-accent-600"
                      />
                      <span className={`flex-1 ${item.is_done ? "line-through text-ui-text-muted" : "text-ui-text-secondary"}`}>
                        {item.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";

const STATUS_OPTIONS = [
  "Not Started",
  "Under Review", 
  "In Development", 
  "Completed"
];

export default function PlanningFormModal({ availableIdeas, onClose, onSubmit }) {
  const [form, setForm] = useState({
    idea_id: "",
    details: "",
    start_date: "",
    due_date: "",
    status: "Not Started",
  });
  const [checklistDraft, setChecklistDraft] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const addChecklistDraftItem = () => {
    if (!newItem.trim()) return;
    setChecklistDraft((items) => [...items, newItem.trim()]);
    setNewItem("");
  };

  const removeChecklistDraftItem = (index) => {
    setChecklistDraft((items) => items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.idea_id) {
      setError("Select an idea to create a planning.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        idea_id: Number(form.idea_id),
        details: form.details.trim() || null,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        status: form.status,
        checklist_items: checklistDraft,
      });
    } catch (err) {
      setError(err.message || "It was not possible to create the planning.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">New planning</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idea</label>
            <select
              value={form.idea_id}
              onChange={(e) => update("idea_id", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              <option value="">Select...</option>
              {availableIdeas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.name}
                </option>
              ))}
            </select>
            {availableIdeas.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">
                No free ideas to plan — all already have a planning.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
            <textarea
              value={form.details}
              onChange={(e) => update("details", e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => update("start_date", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => update("due_date", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial checklist (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addChecklistDraftItem();
                  }
                }}
                placeholder="Item description..."
                className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
              <button
                type="button"
                onClick={addChecklistDraftItem}
                className="text-sm font-medium px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50"
              >
                Add
              </button>
            </div>
            {checklistDraft.length > 0 && (
              <ul className="flex flex-col gap-1">
                {checklistDraft.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-1.5"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeChecklistDraftItem(index)}
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

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              {saving ? "Saving..." : "Create planning"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
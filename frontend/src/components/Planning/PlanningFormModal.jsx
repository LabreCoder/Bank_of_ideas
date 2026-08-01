import { useState } from "react";
import { STATUS_OPTIONS } from "../../pages/Planning";


export default function PlanningFormModal({ availableIdeas, onClose, onSubmit }) {
  // Estado do Formulário Principal
  const [form, setForm] = useState({
    idea_id: "",
    details: "",
    start_date: "",
    due_date: "",
    status: "Not Started",
  });

  // Estado da Lista de Checklist
  const [checklistDraft, setChecklistDraft] = useState([]);
  
  // Estado do Input do Checklist (declarado no topo do componente)
  const [checklistItem, setChecklistItem] = useState({
    description: "",
    due_date: "",
  });

  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const updateForm = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAddChecklistItem = () => {
    if (!checklistItem.description.trim()) return;

    setChecklistDraft((prev) => [...prev, { ...checklistItem }]);
    setChecklistItem({ description: "", due_date: "" });
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
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-[84vw] p-8 max-h-[90vh] overflow-y-auto" style={{ left: "12%", right: "14%", position: "fixed" }}>
        <h3 className="text-lg font-semibold mb-4">New planning</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idea</label>
            <select
              value={form.idea_id}
              onChange={(e) => updateForm("idea_id", e.target.value)}
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
              onChange={(e) => updateForm("details", e.target.value)}
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
                onChange={(e) => updateForm("start_date", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => updateForm("due_date", e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
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
            <div className="flex gap-2 mb-2 items-end">
              <div className="flex-1">
                <input
                  type="text"
                  value={checklistItem.description}
                  onChange={(e) =>
                    setChecklistItem((prev) => ({ ...prev, description: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Evita submeter o formulário principal
                      handleAddChecklistItem();
                    }
                  }}
                  placeholder="Item description..."
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={checklistItem.due_date}
                  onChange={(e) =>
                    setChecklistItem((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                  className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-sm font-medium px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 shrink-0"
              >
                Add
              </button>
            </div>

            {checklistDraft.length > 0 && (
              <ul className="flex flex-col gap-1 mt-2">
                {checklistDraft.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm bg-gray-50 rounded-md px-3 py-1.5 border border-gray-100"
                  >
                    <span className="truncate">
                      {item.description}{" "}
                      {item.due_date && (
                        <span className="text-xs text-gray-400">({item.due_date})</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeChecklistDraftItem(index)}
                      className="text-gray-400 hover:text-red-600 text-xs ml-2"
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
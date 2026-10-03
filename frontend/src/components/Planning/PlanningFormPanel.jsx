import { useState } from "react";
import { STATUS_OPTIONS } from "../../pages/Planning";

function ChecklistEmptyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default function PlanningFormPanel({ availableIdeas, onClose, onSubmit }) {
  const [form, setForm] = useState({
    idea_id: "",
    details: "",
    start_date: "",
    due_date: "",
    status: "Not Started",
  });

  const [checklistDraft, setChecklistDraft] = useState([]);
  const [checklistItem, setChecklistItem] = useState({ description: "", due_date: "" });

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
    <div>
      <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
        ← Planning
      </button>

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold text-gray-900">New planning</h1>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">
          Cancel
        </button>
      </div>
      <p className="text-gray-500 mb-6">Choose an idea and define the next steps.</p>

      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* ---- Planning ---- */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Planning</h3>

              <div className="flex flex-col gap-4">
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
                    rows={8}
                    className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
                  />
                </div>
              </div>
            </div>

            {/* ---- Schedule ---- */}
            <div className="border-l border-gray-100 pl-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h3>

              <div className="flex flex-col gap-4">
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
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-6" />

          {/* ---- Initial checklist (full width) ---- */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Initial checklist</h3>
              <span className="text-xs font-medium text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                optional
              </span>
            </div>

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
                      e.preventDefault();
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

            {checklistDraft.length === 0 ? (
              <div className="flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-md p-4">
                <span className="text-gray-300">
                  <ChecklistEmptyIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-600">No items added</p>
                  <p className="text-xs text-gray-400">
                    Add a first step, or create the plan without a checklist.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
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

          {error && <p className="text-sm text-red-600 mt-6">{error}</p>}

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">Start with an idea. The rest can take shape later.</p>
            <div className="flex gap-2">
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
                {saving ? "Saving..." : "+ Create planning"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

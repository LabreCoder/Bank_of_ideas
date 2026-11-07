import { IDEA_DESCRIPTION_MAX } from "./IdeaDetailPanel";
import { useEffect, useState } from "react";

const EMPTY_FORM = { name: "", description: "", category_id: "", owner_id: "" };

export default function IdeaForm({ categories, owners, onClose, onSubmit, backLabel = "Ideas" }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("The idea must have a name.");
      return;
    }
    if (!form.owner_id) {
      setError("Select an owner for the idea.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        owner_id: Number(form.owner_id),
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message || "It was not possible to save the idea.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in w-full pb-10">
      {/* Top Navigation */}
      <div className="flex items-center gap-2 text-sm text-ui-text-muted mb-6">
        <button onClick={onClose} className="hover:text-ui-text-primary flex items-center gap-1">
          &larr; {backLabel}
        </button>
        <span>/</span>
        <span className="text-ui-text-primary">New idea</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ui-text-primary">New idea</h1>
          <p className="text-ui-text-muted mt-1">Capture an idea and give it a place to grow.</p>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-ui-text-secondary hover:text-ui-text-primary flex items-center gap-2">
          ✕ Cancel
        </button>
      </div>

      {/* Main Content Box */}
      <div className="bg-ui-surface border border-ui-border rounded-xl p-8">
        <form id="new-idea-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Idea Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-ui-text-primary">Idea</h2>
            
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600 focus:border-accent-600"
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <label className="block text-sm font-medium text-ui-text-secondary">Description</label>
                <span
                  className={`text-xs tabular-nums ${
                    form.description.length >= IDEA_DESCRIPTION_MAX
                      ? "text-status-amber-fg"
                      : "text-ui-text-muted"
                  }`}
                >
                  {form.description.length}/{IDEA_DESCRIPTION_MAX}
                </span>
              </div>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={IDEA_DESCRIPTION_MAX}
                rows={8}
                className="w-full text-sm border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600 focus:border-accent-600 resize-none"
              />
            </div>
          </div>

          {/* Right Column: Organization */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-ui-text-primary">Organization</h2>
            
            <div>
              <label className="block text-sm font-medium text-ui-text-secondary mb-1">Category</label>
              <select
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
                className="w-full text-sm bg-ui-surface border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600 focus:border-accent-600"
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
                value={form.owner_id}
                onChange={(e) => update("owner_id", e.target.value)}
                className="w-full text-sm bg-ui-surface border border-ui-border rounded-md px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent-600 focus:border-accent-600"
              >
                <option value="">Select...</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-ui-border mt-6 pt-6 flex justify-end items-center gap-4">
        {error && <p className="text-sm text-status-red-fg mr-auto">{error}</p>}
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-ui-text-secondary hover:text-ui-text-primary"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="new-idea-form"
          disabled={saving}
          className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-6 py-2.5 rounded-md transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
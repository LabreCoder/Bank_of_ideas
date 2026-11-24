import { IDEA_DESCRIPTION_MAX, IDEA_NAME_MAX } from "./IdeaDetailPanel";
import { useEffect, useState, useId } from "react";
import { Button, Card, Input, Label, Select, Textarea } from "../ui";

const EMPTY_FORM = { name: "", description: "", category_id: "", owner_id: "" };

export default function IdeaForm({ categories, owners, onClose, onSubmit, backLabel = "Ideas" }) {
  const fieldId = useId(); // D10: liga <label htmlFor> aos campos
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
        <Button variant="muted" size="inline" onClick={onClose}>
          &larr; {backLabel}
        </Button>
        <span>/</span>
        <span className="text-ui-text-primary">New idea</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-ui-text-primary">New idea</h1>
          <p className="text-ui-text-muted mt-1">Capture an idea and give it a place to grow.</p>
        </div>
        <Button variant="text" size="inline" onClick={onClose}>
          <span aria-hidden="true">✕</span> Cancel
        </Button>
      </div>

      {/* Main Content Box */}
      <Card padding={8} radius="xl">
        <form id="new-idea-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Idea Details */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-ui-text-primary">Idea</h2>
            
            <div>
              <Label htmlFor={`${fieldId}-name`}>Name</Label>
              <Input id={`${fieldId}-name`}
                type="text"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={IDEA_NAME_MAX}
                autoFocus
              />
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1">
                <Label flush htmlFor={`${fieldId}-description`}>Description</Label>
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
              <Textarea id={`${fieldId}-description`}
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={IDEA_DESCRIPTION_MAX}
                rows={8}
                className="resize-none"
              />
            </div>
          </div>

          {/* Right Column: Organization */}
          <div className="flex flex-col gap-6">
            <h2 className="text-lg font-semibold text-ui-text-primary">Organization</h2>
            
            <div>
              <Label htmlFor={`${fieldId}-category`}>Category</Label>
              <Select id={`${fieldId}-category`}
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor={`${fieldId}-owner`}>Owner</Label>
              <Select id={`${fieldId}-owner`}
                value={form.owner_id}
                onChange={(e) => update("owner_id", e.target.value)}
              >
                <option value="">Select...</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </Select>
            </div>
          </div>
        </form>
      </Card>

      {/* Footer Actions */}
      <div className="border-t border-ui-border mt-6 pt-6 flex justify-end items-center gap-4">
        {error && <p className="text-sm text-status-red-fg mr-auto">{error}</p>}
        <Button variant="text" size="inline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" form="new-idea-form" size="lg" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
import { useId, useState } from "react";
import { cycleApi } from "../../services/cycle";
import DetailModal from "../Default/DetailModal";
import { Button, Input, Label, Textarea } from "../ui";

export default function CycleFormModal({ onClose, onCreated }) {
  const fieldId = useId(); // D10: liga <label htmlFor> aos campos
  const [form, setForm] = useState({
    name: "",
    description: "",
    start_date: "",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const titleId = useId();
  // D03: fechar com algo preenchido pede confirmação.
  const dirty = Object.values(form).some((value) => String(value).trim() !== "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.start_date) {
      setError("Name and Start Date are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        start_date: form.start_date,
        due_date: form.due_date || null,
      };
      const created = await cycleApi.create(payload);
      onCreated(created);
    } catch (err) {
      setError(err.message || "Failed to create cycle.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DetailModal onClose={onClose} labelledBy={titleId} dirty={dirty}>
        <h3 id={titleId} className="text-lg font-semibold mb-4">New Cycle</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor={`${fieldId}-name`}>Name</Label>
            <Input id={`${fieldId}-name`}
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q3 2026 Deliverables"
            />
          </div>

          <div>
            <Label htmlFor={`${fieldId}-description`}>Description</Label>
            <Textarea id={`${fieldId}-description`}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              placeholder="Cycle goals and context..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`${fieldId}-start-date`}>Start Date</Label>
              <Input id={`${fieldId}-start-date`}
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor={`${fieldId}-due-date`}>Due Date (Optional)</Label>
              <Input id={`${fieldId}-due-date`}
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
              />
            </div>
          </div>

          {error && <p className="text-sm text-status-red-fg">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create cycle"}
            </Button>
          </div>
        </form>
    </DetailModal>
  );
}
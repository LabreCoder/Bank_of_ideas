import { formatShortDate } from "../../utils/dateFormat";
import { useState, useId } from "react";
import { PLANNING_STATUS_OPTIONS } from "../../utils/planningStatus";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "../ui";

function ChecklistEmptyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

export default function PlanningFormPanel({
  availableIdeas,
  initialIdeaId = "",
  backLabel = "Planning",
  onClose,
  onSubmit,
}) {
  const fieldId = useId(); // D10: liga <label htmlFor> aos campos
  const [form, setForm] = useState({
    idea_id: initialIdeaId, // /planning/new?ideaId=<id> já vem com a ideia selecionada
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
      // Um item digitado mas ainda não adicionado com "Add" também entra.
      const pendingItem = checklistItem.description.trim() ? [checklistItem] : [];
      const items = [...checklistDraft, ...pendingItem];

      await onSubmit({
        idea_id: Number(form.idea_id),
        details: form.details.trim() || null,
        start_date: form.start_date || null,
        due_date: form.due_date || null,
        status: form.status,
        checklist_items: items.map((item, index) => ({
          description: item.description.trim(),
          due_date: item.due_date || null,
          position: index,
        })),
      });
    } catch (err) {
      setError(err.message || "It was not possible to create the planning.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button variant="muted" size="inline" onClick={onClose} className="mb-2">
        ← {backLabel}
      </Button>

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold text-ui-text-primary">New planning</h1>
        <Button variant="muted" size="inline" onClick={onClose}>
          Cancel
        </Button>
      </div>
      <p className="text-ui-text-muted mb-6">Choose an idea and define the next steps.</p>

      <form onSubmit={handleSubmit}>
        <Card padding={6}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ---- Planning ---- */}
            <div>
              <h3 className="text-lg font-semibold text-ui-text-primary mb-4">Planning</h3>

              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor={`${fieldId}-idea`}>Idea</Label>
                  <Select id={`${fieldId}-idea`}
                    value={form.idea_id}
                    onChange={(e) => updateForm("idea_id", e.target.value)}
                  >
                    <option value="">Select...</option>
                    {availableIdeas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.name}
                      </option>
                    ))}
                  </Select>
                  {availableIdeas.length === 0 && (
                    <p className="text-xs text-ui-text-muted mt-1">
                      No free ideas to plan — all already have a planning.
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`${fieldId}-details`}>Details</Label>
                  <Textarea id={`${fieldId}-details`}
                    value={form.details}
                    onChange={(e) => updateForm("details", e.target.value)}
                    rows={8}
                  />
                </div>
              </div>
            </div>

            {/* ---- Schedule ---- */}
            <div className="border-t border-ui-border/60 pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-8">
              <h3 className="text-lg font-semibold text-ui-text-primary mb-4">Schedule</h3>

              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`${fieldId}-start`}>Start</Label>
                    <Input id={`${fieldId}-start`}
                      type="date"
                      value={form.start_date}
                      onChange={(e) => updateForm("start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${fieldId}-due`}>Due</Label>
                    <Input id={`${fieldId}-due`}
                      type="date"
                      value={form.due_date}
                      onChange={(e) => updateForm("due_date", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`${fieldId}-status`}>Status</Label>
                  <Select id={`${fieldId}-status`}
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    {PLANNING_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-ui-border/60 my-6" />

          {/* ---- Initial checklist (full width) ---- */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg font-semibold text-ui-text-primary">Initial checklist</h3>
              <Badge toneClass="border-ui-border text-ui-text-muted">
                optional
              </Badge>
            </div>

            <div className="flex flex-wrap gap-2 mb-2 items-end">
              <div className="flex-1 min-w-[12rem]">
                <Input
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
                  aria-label="New checklist item"
                />
              </div>
              <div>
                <Input
                  type="date"
                  value={checklistItem.due_date}
                  aria-label="Checklist item due date (optional)"
                  onChange={(e) =>
                    setChecklistItem((prev) => ({ ...prev, due_date: e.target.value }))
                  }
                />
              </div>
              <Button variant="secondary" onClick={handleAddChecklistItem} className="shrink-0">
                Add
              </Button>
            </div>

            {checklistDraft.length === 0 ? (
              <div className="flex items-center gap-3 bg-ui-surface-2 border border-dashed border-ui-border rounded-md p-4">
                <span className="text-ui-text-muted/70">
                  <ChecklistEmptyIcon />
                </span>
                <div>
                  <p className="text-sm font-medium text-ui-text-secondary">No items added</p>
                  <p className="text-xs text-ui-text-muted">
                    Add a first step, or create the plan without a checklist.
                  </p>
                </div>
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {checklistDraft.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm bg-ui-surface-2 rounded-md px-3 py-1.5 border border-ui-border/60"
                  >
                    <span className="truncate">
                      {item.description}{" "}
                      {item.due_date && (
                        <span className="text-xs text-ui-text-muted">{formatShortDate(item.due_date)}</span>
                      )}
                    </span>
                    <Button
                      variant="muted-danger"
                      size="inline-xs"
                      onClick={() => removeChecklistDraftItem(index)}
                      aria-label={`Remove ${item.description}`}
                      className="ml-2"
                    >
                      remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {error && <p className="text-sm text-status-red-fg mt-6">{error}</p>}

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-ui-border/60">
            <p className="text-xs text-ui-text-muted">Start with an idea. The rest can take shape later.</p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "+ Create planning"}
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}

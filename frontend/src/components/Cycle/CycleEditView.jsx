import { useId } from "react";
import { formatShortDate } from "../../utils/dateFormat";
import { Button, Input, Label, Select, Textarea } from "../ui";

export default function CycleEditView({
  titleId,
  currentCycle,
  name,
  setName,
  description,
  setDescription,
  startDate,
  setStartDate,
  dueDate,
  setDueDate,
  selectedPlanningId,
  setSelectedPlanningId,
  unassignedPlannings,
  planningCycleNames,
  saving,
  error,
  confirmationPrompt,
  setConfirmationPrompt,
  conflictPrompt,
  setConflictPrompt,
  dirty,
  savedRecently,
  onSave,
  onBindPlanning,
  onUnbindPlanning,
  onDeleteCycle,
  onDone,
  onClose,
}) {
  const fieldId = useId(); // D10: liga <label htmlFor> aos campos
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <Button variant="muted" size="inline" onClick={onDone}>
          ← Back to overview
        </Button>
        <Button variant="muted" size="inline" onClick={onClose}>
          Close
        </Button>
      </div>

      <h2 id={titleId} className="text-xl font-semibold text-ui-text-primary mb-4">
        Edit cycle
      </h2>

      <div className="flex flex-col gap-5">
        {/* D09: nome, descrição, início e fim num único formulário com um só "Save"
            (PUT /cycle/{id} valida tudo junto e é atômico). */}
        <div>
          <Label htmlFor={`${fieldId}-name`}>Name</Label>
          <Input id={`${fieldId}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`${fieldId}-start-date`}>Start Date</Label>
            <Input id={`${fieldId}-start-date`}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`${fieldId}-due-date`}>Due Date (optional)</Label>
            <Input id={`${fieldId}-due-date`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`${fieldId}-description`}>Description</Label>
          <Textarea id={`${fieldId}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {dirty ? (
            <span role="status" className="text-xs font-medium text-status-amber-fg">
              Unsaved changes
            </span>
          ) : (
            savedRecently && (
              <span role="status" className="text-xs font-medium text-status-emerald-fg">
                Saved
              </span>
            )
          )}
          <Button onClick={onSave} disabled={saving || !dirty}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        <div>
          {conflictPrompt && (
            <div className="mt-3 bg-status-amber-bg border border-status-amber-border rounded-md p-3 text-sm text-status-amber-fg">
              <p className="font-semibold mb-1">These cycle dates conflict with bound plannings:</p>
              <ul className="list-disc pl-5 mb-2 text-xs">
                {conflictPrompt.map((c) => (
                  <li key={c.planning_id}>
                    {c.idea_name}: due {formatShortDate(c.candidate_due_date)} — {c.message}
                  </li>
                ))}
              </ul>
              <p className="text-xs mb-2">
                Fix this by editing the conflicting planning's due date, or pick different
                cycle dates.
              </p>
              <Button variant="text" size="xs" onClick={() => setConflictPrompt(null)}>
                Dismiss
              </Button>
            </div>
          )}
        </div>

        <hr className="border-ui-border/60" />

        <div>
          <h4 className="text-sm font-semibold text-ui-text-primary mb-2">Bound Plannings</h4>

          <div className="flex gap-2 mb-3">
            <Select
              value={selectedPlanningId}
              onChange={(e) => setSelectedPlanningId(e.target.value)}
              aria-label="Planning to bind"
              fullWidth={false}
              className="flex-1"
            >
              <option value="">Select planning to bind...</option>
              {unassignedPlannings.map((p) => {
                // D09: N:N continua permitido, mas o usuário vê quando o
                // planning já pertence a outro ciclo.
                const otherCycles = planningCycleNames?.get(p.id) ?? [];
                return (
                  <option key={p.id} value={p.id}>
                    {p.idea?.name || `Planning #${p.id}`}
                    {otherCycles.length > 0 ? ` — also in: ${otherCycles.join(", ")}` : ""}
                  </option>
                );
              })}
            </Select>
            <Button onClick={() => onBindPlanning(false)} disabled={!selectedPlanningId || saving}>
              Bind
            </Button>
          </div>

          {confirmationPrompt && (
            <div className="mb-3 bg-status-blue-bg border border-status-blue-border rounded-md p-3 text-sm text-status-blue-fg flex flex-col gap-2">
              <p>{confirmationPrompt.message}</p>
              <div className="flex gap-2">
                <Button size="xs" onClick={() => onBindPlanning(true)}>
                  Confirm & Apply Date
                </Button>
                <Button variant="text" size="xs" onClick={() => setConfirmationPrompt(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {currentCycle.plannings?.length === 0 ? (
            <p className="text-xs text-ui-text-muted">No plannings bound to this cycle yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {currentCycle.plannings.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between text-sm bg-ui-surface-2 border border-ui-border/60 rounded-md px-3 py-2"
                >
                  <div>
                    <span className="font-medium text-ui-text-primary">{p.idea?.name}</span>
                    <span className="text-xs text-ui-text-muted ml-2">
                      (Due: {formatShortDate(p.due_date, "Not set")})
                    </span>
                  </div>
                  <Button variant="danger-text" size="inline-xs" onClick={() => onUnbindPlanning(p.id)}>
                    Unbind
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-status-red-fg">{error}</p>}

        <div className="flex justify-between items-center pt-3 border-t border-ui-border/60">
          <Button variant="danger-text" size="inline" onClick={onDeleteCycle}>
            Delete Cycle
          </Button>
          <Button variant="soft" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useId } from "react";
import { Badge, Button, ButtonLink, Card, Input, Label, Select, Textarea } from "../ui";

export const IDEA_DESCRIPTION_MAX = 200; // VARCHAR(200) no banco
export const IDEA_NAME_MAX = 200; // VARCHAR(200) no banco (migração Alembic 0002)

// D07: ideia sem planning ganha uma ação direta, em vez de só um aviso.
function NoPlanningState({ idea, loaded }) {
  if (!loaded) return <p className="text-sm text-ui-text-muted mt-2">Loading planning…</p>;
  return (
    <div className="mt-2 rounded-lg border border-dashed border-ui-border p-6 text-center">
      <h2 className="text-lg font-semibold text-ui-text-primary">Planning</h2>
      <p className="mt-1 text-sm text-ui-text-muted">This idea does not have a planning yet.</p>
      {idea.is_active ? (
        <ButtonLink to={`/planning/new?ideaId=${idea.id}`} className="mt-4">
          + Create planning
        </ButtonLink>
      ) : (
        <p className="mt-3 text-xs text-ui-text-muted">Activate the idea to create a planning for it.</p>
      )}
    </div>
  );
}

const SAVE_STATE_LABELS = {
  saving: { text: "Saving…", className: "text-ui-text-muted" },
  saved: { text: "Saved", className: "text-status-emerald-fg" },
  error: { text: "Not saved", className: "text-status-red-fg" },
};
import { ideasApi } from "../../services/ideas";
import { checklistApi } from "../../services/checklist";
import { PLANNING_STATUS_STYLES } from "../../utils/planningStatus";

import { IDEA_STATUS_STYLES, STATUS_FALLBACK_STYLE } from "../../utils/ideaStatus";

export default function IdeaDetail({
  idea,
  planning,
  categories,
  owners,
  backLabel = "Ideas",
  onClose,
  onUpdated,
  onToggleActive,
  planningsLoaded = true,
  onPlanningUpdated,
}) {
  const fieldId = useId(); // D10: liga <label htmlFor> aos campos
  const [name, setName] = useState(idea.name);
  const [description, setDescription] = useState(idea.description || "");
  const [categoryId, setCategoryId] = useState(idea.category?.id ?? "");
  const [ownerId, setOwnerId] = useState(idea.owner.id);
  const [newItem, setNewItem] = useState("");
  const [newItemDue, setNewItemDue] = useState("");
  const [error, setError] = useState(null);
  // D06: feedback do autosave — "idle" | "saving" | "saved" | "error".
  const [saveState, setSaveState] = useState("idle");
  const savedTimer = useRef(null);
  const pendingSaves = useRef(0);

  useEffect(() => {
    setName(idea.name);
    setDescription(idea.description || "");
    setCategoryId(idea.category?.id ?? "");
    setOwnerId(idea.owner.id);
  }, [idea]);

  useEffect(() => () => clearTimeout(savedTimer.current), []);

  // Salva um campo; em erro, `revert` devolve o campo ao valor gravado.
  const saveField = async (patch, revert) => {
    setError(null);
    clearTimeout(savedTimer.current);
    pendingSaves.current += 1;
    setSaveState("saving");
    try {
      const updated = await ideasApi.update(idea.id, patch);
      onUpdated(updated);
      pendingSaves.current -= 1;
      if (pendingSaves.current === 0) {
        setSaveState("saved");
        savedTimer.current = setTimeout(() => setSaveState("idle"), 2500);
      }
    } catch (err) {
      pendingSaves.current -= 1;
      setSaveState("error");
      revert?.();
      setError(err.message || "It was not possible to update the idea.");
    }
  };

  const statusClass = IDEA_STATUS_STYLES[idea.execution_status] || STATUS_FALLBACK_STYLE;

  const handleNameBlur = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      // Nome não pode ficar vazio: volta ao valor salvo em vez de deixar o
      // campo em branco na tela sem gravar nada.
      setName(idea.name);
      setError("The name can't be empty — the previous name was restored.");
      return;
    }
    if (trimmed !== idea.name) saveField({ name: trimmed }, () => setName(idea.name));
    else if (trimmed !== name) setName(trimmed);
  };

  const handleDescriptionBlur = () => {
    const trimmed = description.trim() || null;
    if (trimmed !== (idea.description || null)) {
      saveField({ description: trimmed }, () => setDescription(idea.description || ""));
    }
  };

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    saveField({ category_id: value ? Number(value) : null }, () =>
      setCategoryId(idea.category?.id ?? "")
    );
  };

  const handleOwnerChange = (value) => {
    setOwnerId(value);
    saveField({ owner_id: Number(value) }, () => setOwnerId(idea.owner.id));
  };
  
  const handleAddItem = async () => {
    if (!newItem.trim() || !planning) return;
    setError(null);
    try {
      // D07: mesmo formulário do detalhe do planning (descrição + data opcional).
      const updated = await checklistApi.addChecklistItem(planning.id, {
        description: newItem.trim(),
        due_date: newItemDue || null,
      });
      onPlanningUpdated(updated);
      setNewItem("");
      setNewItemDue("");
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
        <Button variant="muted" size="inline" onClick={onClose}>
          &larr; {backLabel}
        </Button>
        <span>/</span>
        <span className="min-w-0 text-ui-text-primary [overflow-wrap:anywhere]">{idea.name}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-ui-text-primary [overflow-wrap:anywhere]">{idea.name}</h1>
          <p className="text-ui-text-muted mt-1">Idea details and planning, together in one place.</p>
        </div>
        <Button variant="text" size="inline" onClick={onClose} className="shrink-0">
          <span aria-hidden="true">✕</span> Close
        </Button>
      </div>

      {/* Main Container */}
      <Card padding={8} radius="xl" className="flex flex-col md:flex-row gap-12">
        
        {/* Left Column: Idea Details */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-ui-text-primary">Idea</h2>
              {/* aria-live: leitores de tela anunciam "Saving…/Saved" */}
              <span
                role="status"
                aria-live="polite"
                className={`text-xs ${SAVE_STATE_LABELS[saveState]?.className ?? ""}`}
              >
                {SAVE_STATE_LABELS[saveState]?.text ?? ""}
              </span>
            </div>
            <Badge toneClass={statusClass}>{idea.execution_status}</Badge>
          </div>
          <p className="text-xs text-ui-text-muted -mt-4 mb-4">Changes are saved automatically.</p>

          {error && (
            <p role="alert" className="text-sm text-status-red-fg mb-4">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-4 flex-grow">
            <div>
              <Label htmlFor={`${fieldId}-name`}>Name</Label>
              <Input id={`${fieldId}-name`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                maxLength={IDEA_NAME_MAX}
              />
            </div>
            <div>
              <div className="flex items-baseline justify-between mb-1">
                <Label flush htmlFor={`${fieldId}-description`}>Description</Label>
                <span
                  className={`text-xs tabular-nums ${
                    description.length >= IDEA_DESCRIPTION_MAX ? "text-status-amber-fg" : "text-ui-text-muted"
                  }`}
                >
                  {description.length}/{IDEA_DESCRIPTION_MAX}
                </span>
              </div>
              <Textarea id={`${fieldId}-description`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                maxLength={IDEA_DESCRIPTION_MAX}
                rows={8}
                className="resize-none"
              />
            </div>
            <div>
              <Label htmlFor={`${fieldId}-category`}>Category</Label>
              <Select id={`${fieldId}-category`}
                value={categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
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
                value={ownerId}
                onChange={(e) => handleOwnerChange(e.target.value)}
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="mt-8 pt-4">
            <button
              type="button"
              onClick={() => onToggleActive(idea)}
              className={`text-sm font-medium hover:underline ${
                idea.is_active ? "text-status-red-fg" : "text-status-emerald-fg"
              }`}
            >
              {idea.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>

        {/* Vertical Divider (Desktop) */}
        <div className="hidden md:block w-px bg-ui-surface-2 -my-8"></div>

        {/* Right Column: Planning */}
        <div className="flex-1 flex flex-col">
          {!planning ? (
            <NoPlanningState idea={idea} loaded={planningsLoaded} />
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-ui-text-primary">Planning</h2>
                <Badge toneClass={PLANNING_STATUS_STYLES[planning.status]}>{planning.status}</Badge>
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

                <div className="flex flex-wrap gap-2 mb-4">
                  <Input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    placeholder="New item..."
                    aria-label="New checklist item"
                    fullWidth={false}
                    className="flex-1 min-w-[12rem]"
                  />
                  <Input
                    type="date"
                    value={newItemDue}
                    onChange={(e) => setNewItemDue(e.target.value)}
                    aria-label="Due date (optional)"
                    fullWidth={false}
                  />
                  <Button variant="secondary" onClick={handleAddItem}>
                    Add
                  </Button>
                </div>

                <ul className="flex flex-col gap-2">
                  {planning.checklist_items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 text-sm border border-ui-border/60 rounded-md px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.is_done}
                        onChange={() => handleToggleItem(item.id)}
                        aria-label={`Mark "${item.description}" as done`}
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
      </Card>
    </div>
  );
}
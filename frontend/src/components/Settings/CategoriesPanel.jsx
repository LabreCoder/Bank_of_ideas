import { useEffect, useState } from "react";
import ConfirmDialog from "../Default/ConfirmDialog";
import { categoriesApi } from "../../services/categories";
import { Button, Card, IconButton, Input, Textarea } from "../ui";

const EMPTY_DRAFT = { name: "", description: "" };

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export default function CategoriesPanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newDraft, setNewDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_DRAFT);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoriesApi.list();
      setCategories(data);
    } catch (err) {
      setError(err.message || "It was not possible to load the categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAdd = async () => {
    if (!newDraft.name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const created = await categoriesApi.create({
        name: newDraft.name.trim(),
        description: newDraft.description.trim() || null,
      });
      setCategories((prev) => [created, ...prev]);
      setNewDraft(EMPTY_DRAFT);
    } catch (err) {
      setError(err.message || "It was not possible to add the category.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setEditDraft({ name: category.name, description: category.description || "" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(EMPTY_DRAFT);
  };

  const handleSaveEdit = async (id) => {
    if (!editDraft.name.trim()) return;
    setError(null);
    try {
      const updated = await categoriesApi.update(id, {
        name: editDraft.name.trim(),
        description: editDraft.description.trim() || null,
      });
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      cancelEditing();
    } catch (err) {
      setError(err.message || "It was not possible to update the category.");
    }
  };

  // D03: exclusão só depois de confirmar no ConfirmDialog.
  const [pendingDelete, setPendingDelete] = useState(null);

  const handleDelete = async (id) => {
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      // Ex: 409 se alguma ideia ainda referencia essa categoria.
      setError(err.message || "It was not possible to remove the category.");
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Categories</h3>
      <p className="text-ui-text-muted text-sm mb-4">
        Manage your content categories. You can add, edit, or remove categories as needed.
      </p>

      {/* Formulário de criação */}
      <div className="border border-dashed border-ui-border rounded-lg p-3 mb-4 flex flex-col gap-2">
        <div className="grid sm:grid-cols-1 gap-2">
          <Input
            type="text"
            value={newDraft.name}
            onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Category name..."
            aria-label="Category name"
            fullWidth={false}
          />
          <Input
            type="text"
            value={newDraft.description}
            onChange={(e) => setNewDraft((d) => ({ ...d, description: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Description (optional)..."
            aria-label="Category description"
            fullWidth={false}
            className="h-[100px]"
          />
        </div>
        <Button
          variant="primary"
          size="md"
          onClick={handleAdd}
          disabled={saving || !newDraft.name.trim()}
          className="self-start"
        >
          {saving ? "Adding..." : "+ Add category"}
        </Button>
      </div>

      {error && <p className="text-sm text-status-red-fg mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-ui-text-muted">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-ui-text-muted">No categories yet.</p>
      ) : (
        <div className="grid sm:grid-cols-4 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="border border-ui-border rounded-lg p-3">
              {editingId === c.id ? (
                <div className="flex flex-col gap-2">
                  <Input
                    type="text"
                    value={editDraft.name}
                    aria-label="Name"
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    autoFocus
                    size="sm"
                    fullWidth={false}
                    className="font-medium"
                  />
                  <Textarea
                    value={editDraft.description}
                    onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelEditing();
                    }}
                    rows={2}
                    placeholder="Description..."
                    aria-label="Category description"
                    size="sm"
                    fullWidth={false}
                    className="text-ui-text-secondary"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="muted" size="xs" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={!editDraft.name.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-ui-text-primary text-sm">{c.name}</p>
                    <p
                      className={`text-sm mt-0.5 ${
                        c.description ? "text-ui-text-muted" : "text-ui-text-muted/70 italic"
                      }`}
                    >
                      {c.description || "No description"}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <IconButton label={`Edit ${c.name}`} tone="accent" size="md" onClick={() => startEditing(c)}>
                      <PencilIcon />
                    </IconButton>
                    <IconButton label={`Remove ${c.name}`} tone="danger" size="md" onClick={() => setPendingDelete(c)}>
                      <TrashIcon />
                    </IconButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this category?"
        message={
          <>
            <strong>{pendingDelete?.name}</strong> will be deleted. Categories still used by an idea cannot be deleted — change those ideas first. This cannot be
            undone.
          </>
        }
        confirmLabel="Delete category"
        onConfirm={() => {
          const id = pendingDelete.id;
          setPendingDelete(null);
          handleDelete(id);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </Card>
  );
}

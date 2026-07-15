import { useEffect, useState } from "react";
import { ownersApi } from "../../services/owners";

const EMPTY_DRAFT = { name: "" };

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export default function OwnersPanel() {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newDraft, setNewDraft] = useState(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(EMPTY_DRAFT);

  const loadOwners = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownersApi.list();
      setOwners(data);
    } catch (err) {
      setError(err.message || "It was not possible to load the owners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwners();
  }, []);

  const handleAdd = async () => {
    if (!newDraft.name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const created = await ownersApi.create({
        name: newDraft.name.trim(),
      });
      setOwners((prev) => [created, ...prev]);
      setNewDraft(EMPTY_DRAFT);
    } catch (err) {
      setError(err.message || "It was not possible to add the owner.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (owner) => {
    setEditingId(owner.id);
    setEditDraft({ name: owner.name || "" });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditDraft(EMPTY_DRAFT);
  };

  const handleSaveEdit = async (id) => {
    if (!editDraft.name.trim()) return;
    setError(null);
    try {
      const updated = await ownersApi.update(id, {
        name: editDraft.name.trim(),
      });
      setOwners((prev) => prev.map((o) => (o.id === id ? updated : o)));
      cancelEditing();
    } catch (err) {
      setError(err.message || "It was not possible to update the owner.");
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    try {
      await ownersApi.delete(id);
      setOwners((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      // Ex: 409 se alguma ideia ainda referencia essa categoria.
      setError(err.message || "It was not possible to remove the owner.");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-semibold mb-2">Owners</h3>
      <p className="text-gray-500 text-sm mb-4">
        Manage your content owners. You can add, edit, or remove owners as needed.
      </p>

      {/* Formulário de criação */}
      <div className="border border-dashed border-gray-300 rounded-lg p-3 mb-4 flex flex-col gap-2">
        <div className="grid sm:grid-cols-1 gap-2">
          <input
            type="text"
            value={newDraft.name}
            onChange={(e) => setNewDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder="Owner name..."
            className="text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
          />{/*
          <input
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
            className="h-[100px] text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
          />*/}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={saving || !newDraft.name.trim()}
          className="self-start bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          {saving ? "Adding..." : "+ Add owner"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-400">Loading owners...</p>
      ) : owners.length === 0 ? (
        <p className="text-sm text-gray-400">No owners yet.</p>
      ) : (
        <div className="grid sm:grid-cols-4 gap-3">
          {owners.map((c) => (
            <div key={c.id} className="border border-gray-200 rounded-lg p-3">
              {editingId === c.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editDraft.name}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    autoFocus
                    className="text-sm font-medium border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-600"
                  />{/*
                  <textarea
                    value={editDraft.description}
                    onChange={(e) => setEditDraft((d) => ({ ...d, description: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelEditing();
                    }}
                    rows={2}
                    placeholder="Description..."
                    className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent-600"
                  />*/}
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEditing}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(c.id)}
                      disabled={!editDraft.name.trim()}
                      className="text-xs font-medium bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white px-3 py-1 rounded-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                    {/*<p
                      className={`text-sm mt-0.5 ${
                        c.description ? "text-gray-500" : "text-gray-300 italic"
                      }`}
                    >
                      {c.description || "No description"}
                    </p>*/}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEditing(c)}
                      title="Edit"
                      className="p-1.5 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-md transition-colors"
                    >
                      <PencilIcon />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Remove"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
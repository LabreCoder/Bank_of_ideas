import { useEffect, useState } from "react";

const EMPTY_FORM = { name: "", description: "", category_id: "", owner_id: "" };

export default function IdeaFormModal({ idea, categories, owners, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(idea);

  useEffect(() => {
    if (idea) {
      setForm({
        name: idea.name,
        description: idea.description || "",
        category_id: idea.category?.id ?? "",
        owner_id: idea.owner.id,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [idea]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("O nome da ideia é obrigatório.");
      return;
    }
    if (!form.owner_id) {
      setError("Selecione um dono para a ideia.");
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
      setError(err.message || "Não foi possível salvar a ideia.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg border border-gray-200 w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? "Editar ideia" : "Nova ideia"}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={form.category_id}
              onChange={(e) => update("category_id", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dono</label>
            <select
              value={form.owner_id}
              onChange={(e) => update("owner_id", e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-600"
            >
              <option value="">Selecione...</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-md"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
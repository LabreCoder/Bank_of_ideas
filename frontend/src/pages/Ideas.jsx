import { useEffect, useMemo, useState } from "react";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import IdeaCard from "../components/IdeaCard";
import IdeaFilters from "../components/IdeaFilters";
import IdeaFormModal from "../components/IdeaFormModal";

const EMPTY_FILTERS = { name: "", categoryId: "", ownerId: "", status: "",active: "" };

export default function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalIdea, setModalIdea] = useState(null); // null = fechado, {} = criar, {...} = editar
  const [modalOpen, setModalOpen] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ideasData, categoriesData, ownersData] = await Promise.all([
        ideasApi.list(),
        categoriesApi.list(),
        ownersApi.list(),
      ]);
      setIdeas(ideasData);
      setCategories(categoriesData);
      setOwners(ownersData);
    } catch (err) {
      setError(err.message || "It was not possible to load the data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Filtragem combinada no cliente. Para o volume de dados de um painel
  // pessoal isso é suficiente; se a lista crescer muito, mover os filtros
  // de categoria/dono/nome para query params no backend (como já existe
  // para "active") evita trafegar tudo de uma vez.
  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (
        filters.name &&
        !idea.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }
      if (filters.categoryId && idea.category?.id !== Number(filters.categoryId)) {
        return false;
      }
      if (filters.ownerId && idea.owner.id !== Number(filters.ownerId)) {
        return false;
      }
      if (filters.status && idea.execution_status !== filters.status) return false;
      if (filters.active === "true" && !idea.is_active) return false;
      if (filters.active === "false" && idea.is_active) return false;
      return true;
    });
  }, [ideas, filters]);

  const openCreateModal = () => {
    setModalIdea(null);
    setModalOpen(true);
  };

  const openEditModal = (idea) => {
    setModalIdea(idea);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload) => {
    if (modalIdea) {
      const updated = await ideasApi.update(modalIdea.id, payload);
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } else {
      const created = await ideasApi.create(payload);
      setIdeas((prev) => [created, ...prev]);
    }
    setModalOpen(false);
  };

  const handleToggleActive = async (idea) => {
    try {
      const updated = await ideasApi.toggleActive(idea.id);
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    } catch (err) {
      setError(err.message || "It was not possible to update the idea status.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Ideas</h2>
          <p className="text-gray-500">
            Register, edit, and activate/deactivate your content ideas.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New Idea
        </button>
      </div>

      <IdeaFilters
        categories={categories}
        owners={owners}
        filters={filters}
        onChange={setFilters}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          Loading ideas...
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          No ideas found with the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={openEditModal}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <IdeaFormModal
          idea={modalIdea}
          categories={categories}
          owners={owners}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import PlanningCard from "../components/Planning/PlanningCard";
import PlanningFormModal from "../components/Planning/PlanningFormModal";
import PlanningDetailModal from "../components/Planning/PlanningDetailModal";
import FilterInfo from "../components/Filters/FilterInfo";
import { useIdeaFilters } from "../hooks/useIdeaFilters";

export const STATUS_OPTIONS = [
  "Not Started",
  "Under Review", 
  "Started",
  "In Development", 
  "Completed",
  "Cancelled"
];

export default function Planning() {
  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPlanning, setDetailPlanning] = useState(null);
  const { filters, setFilters, resetFilters } = useIdeaFilters();

  // 1. Carrega os Plannings da API junto com os outros dados
  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [planningsData, ideasData, categoriesData, ownersData] = await Promise.all([
        planningApi.list(), // <-- Adicionado aqui!
        ideasApi.list(),
        categoriesApi.list(),
        ownersApi.list(),
      ]);
      setPlannings(planningsData);
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

  // 2. Filtra a lista de PLANNINGS (acessando planning.idea)
  const filteredPlannings = useMemo(() => {
    if (!Array.isArray(plannings)) return [];

    return plannings.filter((planning) => {
      const idea = planning.idea || {};

      // Filtro por Nome da Ideia
      if (
        filters.name &&
        !idea.name?.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      // Filtro por Categoria
      if (
        filters.categoryId &&
        idea.category?.id !== Number(filters.categoryId)
      ) {
        return false;
      }

      // Filtro por Dono/Proprietário
      if (
        filters.ownerId &&
        idea.owner?.id !== Number(filters.ownerId)
      ) {
        return false;
      }

      // Filtro por Status (Compara com o status do planning ou execution_status da ideia)
      if (filters.status) {
        const matchesPlanningStatus = planning.status === filters.status;
        const matchesExecutionStatus = idea.execution_status === filters.status;
        if (!matchesPlanningStatus && !matchesExecutionStatus) {
          return false;
        }
      }

      // Filtro por Ativo/Inativo
      if (filters.active === "true" && !idea.is_active) {
        return false;
      }
      if (filters.active === "false" && idea.is_active) {
        return false;
      }

      return true;
    });
  }, [plannings, filters]);

  // Ideias "Free" para o modal de criação
  const availableIdeas = useMemo(
    () => ideas.filter((idea) => idea.execution_status === "Free" && idea.is_active),
    [ideas]
  );

  const handleCreate = async (payload) => {
    const created = await planningApi.create(payload);
    setPlannings((prev) => [created, ...prev]);
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === created.idea?.id ? { ...idea, execution_status: "In Planning" } : idea
      )
    );
    setCreateOpen(false);
  };

  const handleUpdated = (updated) => {
    setPlannings((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setDetailPlanning(updated);
  };

  const handleDeleted = (planningId) => {
    const removed = plannings.find((p) => p.id === planningId);
    setPlannings((prev) => prev.filter((p) => p.id !== planningId));
    if (removed && removed.idea) {
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === removed.idea.id ? { ...idea, execution_status: "Free" } : idea
        )
      );
    }
    setDetailPlanning(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Planning</h2>
          <p className="text-gray-500">
            Organize ideas into content plans, track dates and checklist progress.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New Planning
        </button>
      </div>

      <FilterInfo
        categories={categories}
        owners={owners}
        filters={filters}
        onChange={setFilters}
        onClear={resetFilters} 
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          Loading plannings...
        </div>
      ) : filteredPlannings.length === 0 ? ( // 3. Renderiza filteredPlannings em vez de plannings
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          No planning found with the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlannings.map((planning) => ( // 3. Mapeia a lista filtrada
            <PlanningCard 
              key={planning.id} 
              planning={planning}
              checklist={planning.checklist_items} 
              onOpen={setDetailPlanning} 
            />
          ))}
        </div>
      )}

      {createOpen && (
        <PlanningFormModal
          availableIdeas={availableIdeas}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {detailPlanning && (
        <PlanningDetailModal
          planning={detailPlanning}
          onClose={() => setDetailPlanning(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
import { useEffect, useMemo, useState } from "react";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import PlanningCard from "../components/Planning/PlanningCard";
import PlanningFormModal from "../components/Planning/PlanningFormModal";
import PlanningDetailModal from "../components/Planning/PlanningDetailModal";
import FilterInfo from "../components/Filters/FilterInfo";
import TabBar from "../components/Filters/TabBar";
import { useIdeaFilters } from "../hooks/useIdeaFilters";

export const STATUS_OPTIONS = [
  "Not Started",
  "Under Review",
  "Started",
  "In Development",
  "Completed",
  "Cancelled",
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
  const [activeTab, setActiveTab] = useState("All");
  const { filters, setFilters, resetFilters } = useIdeaFilters();

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [planningsData, ideasData, categoriesData, ownersData] = await Promise.all([
        planningApi.list(),
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

  // Contagem por status, pra mostrar o número em cada aba (ex: "Started (3)").
  const tabCounts = useMemo(() => {
    const counts = { All: plannings.length };
    for (const status of STATUS_OPTIONS) {
      counts[status] = plannings.filter((p) => p.status === status).length;
    }
    return counts;
  }, [plannings]);

  const tabs = useMemo(
    () => [
      { value: "All", label: "All", count: tabCounts.All },
      ...STATUS_OPTIONS.map((status) => ({
        value: status,
        label: status,
        count: tabCounts[status],
      })),
    ],
    [tabCounts]
  );

  const filteredPlannings = useMemo(() => {
    if (!Array.isArray(plannings)) return [];

    return plannings.filter((planning) => {
      // Aba: filtra por status do planning. "All" não filtra nada aqui.
      if (activeTab !== "All" && planning.status !== activeTab) {
        return false;
      }

      const idea = planning.idea || {};

      if (filters.name && !idea.name?.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.categoryId && idea.category?.id !== Number(filters.categoryId)) {
        return false;
      }
      if (filters.ownerId && idea.owner?.id !== Number(filters.ownerId)) {
        return false;
      }
      if (filters.active === "true" && !idea.is_active) {
        return false;
      }
      if (filters.active === "false" && idea.is_active) {
        return false;
      }

      return true;
    });
  }, [plannings, filters, activeTab]);

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
      <div className="mb-4 flex justify-between items-center">
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-700"
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
      ) : filteredPlannings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          No planning found with the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlannings.map((planning) => (
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
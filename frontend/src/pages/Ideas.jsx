import { useEffect, useMemo, useState } from "react";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import { planningApi } from "../services/planning";
import IdeaCard from "../components/Ideas/IdeaCard";
import IdeaFormModal from "../components/Ideas/IdeaFormModal";
import IdeaDetailModal from "../components/Ideas/IdeaDetailModal";
import FilterInfo from "../components/Filters/FilterInfo";
import TabBar from "../components/Filters/TabBar";
import ToggleSwitch from "../components/Filters/ToggleSwitch";
import { useIdeaFilters } from "../hooks/useIdeaFilters";

const EXECUTION_STATUS_OPTIONS = ["Free", "In Planning"];

export default function Ideas() {
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { filters, setFilters, resetFilters } = useIdeaFilters();
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewingIdea, setViewingIdea] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [showInactive, setShowInactive] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ideasData, categoriesData, ownersData, planningsData] = await Promise.all([
        ideasApi.list(),
        categoriesApi.list(),
        ownersApi.list(),
        planningApi.list(),
      ]);
      setIdeas(ideasData);
      setCategories(categoriesData);
      setOwners(ownersData);
      setPlannings(planningsData);
    } catch (err) {
      setError(err.message || "It was not possible to load the data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const planningByIdeaId = useMemo(() => {
    const map = new Map();
    for (const planning of plannings) {
      map.set(planning.idea.id, planning);
    }
    return map;
  }, [plannings]);

  const tabCounts = useMemo(() => {
    const counts = { All: ideas.length };
    for (const status of EXECUTION_STATUS_OPTIONS) {
      counts[status] = ideas.filter((idea) => idea.execution_status === status).length;
    }
    return counts;
  }, [ideas]);

  const tabs = useMemo(
    () => [
      { value: "All", label: "All", count: tabCounts.All },
      ...EXECUTION_STATUS_OPTIONS.map((status) => ({
        value: status,
        label: status,
        count: tabCounts[status],
      })),
    ],
    [tabCounts]
  );

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (activeTab !== "All" && idea.execution_status !== activeTab) return false;
      if (!showInactive && !idea.is_active) return false;
      if (filters.name && !idea.name.toLowerCase().includes(filters.name.toLowerCase())) {
        return false;
      }
      if (filters.categoryId && idea.category?.id !== Number(filters.categoryId)) {
        return false;
      }
      if (filters.ownerId && idea.owner?.id !== Number(filters.ownerId)) {
        return false;
      }
      return true;
    });
  }, [ideas, filters, activeTab, showInactive]);

  const handleCreate = async (payload) => {
    const created = await ideasApi.create(payload);
    setIdeas((prev) => [created, ...prev]);
    setCreateOpen(false);
  };

  const handleIdeaUpdated = (updated) => {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setViewingIdea(updated);
  };

  const handleToggleActive = async (idea) => {
    try {
      const updated = await ideasApi.toggleActive(idea.id);
      setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setViewingIdea((current) => (current?.id === updated.id ? updated : current));
    } catch (err) {
      setError(err.message || "It was not possible to update the idea status.");
    }
  };

  const handlePlanningUpdated = (updatedPlanning) => {
    setPlannings((prev) => prev.map((p) => (p.id === updatedPlanning.id ? updatedPlanning : p)));
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
          onClick={() => setCreateOpen(true)}
          className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New Idea
        </button>
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

      <FilterInfo
        categories={categories}
        owners={owners}
        filters={filters}
        onChange={setFilters}
        onClear={resetFilters}
        showActive={false}
      />

      <div className="flex justify-end mb-4 -mt-2">
        <ToggleSwitch checked={showInactive} onChange={setShowInactive} label="Show inactive" />
      </div>

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
            <IdeaCard key={idea.id} idea={idea} onOpen={setViewingIdea} />
          ))}
        </div>
      )}

      {createOpen && (
        <IdeaFormModal
          idea={null}
          categories={categories}
          owners={owners}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}

      {viewingIdea && (
        <IdeaDetailModal
          idea={viewingIdea}
          planning={planningByIdeaId.get(viewingIdea.id) || null}
          categories={categories}
          owners={owners}
          onClose={() => setViewingIdea(null)}
          onUpdated={handleIdeaUpdated}
          onToggleActive={handleToggleActive}
          onPlanningUpdated={handlePlanningUpdated}
        />
      )}
    </div>
  );
}
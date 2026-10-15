import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import PlanningCard from "../components/Planning/PlanningCard";
import PlanningFormPanel from "../components/Planning/PlanningFormPanel";
import PlanningDetailPanel from "../components/Planning/PlanningDetailPanel";
import IdeaFilterBar from "../components/Filters/IdeaFilterBar";
import { useIdeaFilters } from "../hooks/useIdeaFilters";
import { matchesIdeaFilters } from "../utils/ideaFilters";

export const STATUS_OPTIONS = [
  "Not Started",
  "Under Review",
  "Started",
  "In Development",
  "Completed",
  "Cancelled",
];

export default function Planning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Quando um planning é aberto a partir de outra página (Dashboard, Cycles...),
  // a origem chega em location.state.fromLabel. Fechar o detalhe volta pra lá.
  const [originLabel] = useState(() => location.state?.fromLabel ?? null);
  const [openedFromOrigin, setOpenedFromOrigin] = useState(false);
  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPlanning, setDetailPlanning] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const { filters, updateFilter, resetFilters, activeCount } = useIdeaFilters();

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

  useEffect(() => {
    const planningIdParam = searchParams.get("planningId");
    if (!planningIdParam || !plannings.length) return;

    const planningId = Number(planningIdParam);
    if (!Number.isFinite(planningId)) return;

    const targetPlanning = plannings.find((planning) => planning.id === planningId);
    if (!targetPlanning) return;

    setDetailPlanning(targetPlanning);
    setOpenedFromOrigin(true);
    // replace: remove ?planningId sem criar entrada no histórico, senão o
    // "voltar" cairia de novo em /planning?planningId=... e reabriria o detalhe.
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("planningId");
        return next;
      },
      { replace: true, state: location.state }
    );
  }, [searchParams, plannings, setSearchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabCounts = useMemo(() => {
    const base = plannings.filter((p) => matchesIdeaFilters(p.idea || {}, filters));
    const counts = { All: base.length };
    for (const status of STATUS_OPTIONS) {
      counts[status] = base.filter((p) => p.status === status).length;
    }
    return counts;
  }, [plannings, filters]);

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
      if (activeTab !== "All" && planning.status !== activeTab) {
        return false;
      }
      return matchesIdeaFilters(planning.idea || {}, filters);
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

  const goBackToOrigin = () => navigate(-1);

  const handleCloseDetail = () => {
    if (openedFromOrigin && originLabel) goBackToOrigin();
    else setDetailPlanning(null);
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
    handleCloseDetail();
  };

  if (detailPlanning) {
    return (
      <PlanningDetailPanel
        planning={detailPlanning}
        backLabel={openedFromOrigin && originLabel ? originLabel : "Planning"}
        onClose={handleCloseDetail}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    );
  }

  if (createOpen) {
    return (
      <PlanningFormPanel
        availableIdeas={availableIdeas}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    );
  }

  return (
    <div className="animate-fade-in pb-10">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ui-text-primary md:text-5xl">
              Planning
            </h2>
            <p className="mt-3 text-lg text-ui-text-secondary italic">
             Ideas in motion. Keep every next step in view.
            </p>
          </div>
        </header>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-800 shrink-0"
        >
          + New Planning
        </button>
      </div>

      <IdeaFilterBar
        tabs={{ items: tabs, active: activeTab, onChange: setActiveTab }}
        categories={categories}
        owners={owners}
        filters={filters}
        onChange={updateFilter}
        onClear={resetFilters}
        activeCount={activeCount}
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
    </div>
  );
}
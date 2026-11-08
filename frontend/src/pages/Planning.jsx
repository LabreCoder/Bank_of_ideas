import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import PlanningCard from "../components/Planning/PlanningCard";
import PlanningFormPanel from "../components/Planning/PlanningFormPanel";
import PlanningDetailPanel from "../components/Planning/PlanningDetailPanel";
import IdeaFilterBar from "../components/Filters/IdeaFilterBar";
import NotFoundMessage from "../components/Default/NotFoundMessage";
import { useIdeaFilters } from "../hooks/useIdeaFilters";
import { useGoBack } from "../hooks/useGoBack";
import { matchesIdeaFilters } from "../utils/ideaFilters";

import { PLANNING_STATUS_OPTIONS } from "../utils/planningStatus";

// D02: lista (/planning), criação (/planning/new) e detalhe (/planning/:id)
// vêm da URL — voltar do navegador, F5 e links compartilhados funcionam.
export default function Planning() {
  const { planningId: planningParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { goBack, hasInternalHistory } = useGoBack("/planning");

  const isCreate = planningParam === "new";
  const detailId = planningParam && !isCreate ? Number(planningParam) : null;
  const invalidParam = Boolean(planningParam) && !isCreate && !Number.isInteger(detailId);

  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Planning buscado por id (GET /planning/{id}) quando a URL é aberta direto
  // e a lista ainda não o contém.
  const [fetchedPlanning, setFetchedPlanning] = useState(null);
  const [notFound, setNotFound] = useState(false);
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

  const listedPlanning = detailId ? plannings.find((p) => p.id === detailId) : null;
  const detailPlanning =
    listedPlanning ?? (fetchedPlanning?.id === detailId ? fetchedPlanning : null);

  useEffect(() => {
    setNotFound(false);
    if (!detailId || listedPlanning) return undefined;
    let cancelled = false;
    planningApi
      .get(detailId)
      .then((planning) => !cancelled && setFetchedPlanning(planning))
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || "It was not possible to load the planning.");
      });
    return () => {
      cancelled = true;
    };
  }, [detailId, Boolean(listedPlanning)]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabCounts = useMemo(() => {
    const base = plannings.filter((p) => matchesIdeaFilters(p.idea || {}, filters));
    const counts = { All: base.length };
    for (const status of PLANNING_STATUS_OPTIONS) {
      counts[status] = base.filter((p) => p.status === status).length;
    }
    return counts;
  }, [plannings, filters]);

  const tabs = useMemo(
    () => [
      { value: "All", label: "All", count: tabCounts.All },
      ...PLANNING_STATUS_OPTIONS.map((status) => ({
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
    goBack();
  };

  const handleUpdated = (updated) => {
    setPlannings((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setFetchedPlanning((current) => (current?.id === updated.id ? updated : current));
  };

  const handleDeleted = (planningId) => {
    const removed = plannings.find((p) => p.id === planningId) ?? detailPlanning;
    setPlannings((prev) => prev.filter((p) => p.id !== planningId));
    setFetchedPlanning(null);
    if (removed && removed.idea) {
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === removed.idea.id ? { ...idea, execution_status: "Free" } : idea
        )
      );
    }
    goBack();
  };

  if (invalidParam || (detailId && notFound)) {
    return <NotFoundMessage title="Planning not found" listPath="/planning" listLabel="Planning" />;
  }

  if (detailId) {
    if (!detailPlanning) {
      return (
        <div className="py-20 text-center text-ui-text-muted">
          {error || "Loading planning..."}
        </div>
      );
    }
    return (
      <PlanningDetailPanel
        planning={detailPlanning}
        backLabel={hasInternalHistory ? "Back" : "Planning"}
        onClose={goBack}
        onUpdated={handleUpdated}
        onDeleted={handleDeleted}
      />
    );
  }

  if (isCreate) {
    return (
      <PlanningFormPanel
        availableIdeas={availableIdeas}
        initialIdeaId={searchParams.get("ideaId") || ""}
        backLabel={hasInternalHistory ? "Back" : "Planning"}
        onClose={goBack}
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
          onClick={() => navigate("/planning/new")}
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
        <div className="bg-status-red-bg border border-status-red-border text-status-red-fg text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-ui-surface rounded-lg border border-ui-border p-4 h-96 flex items-center justify-center text-ui-text-muted">
          Loading plannings...
        </div>
      ) : filteredPlannings.length === 0 ? (
        <div className="bg-ui-surface rounded-lg border border-ui-border p-4 h-96 flex items-center justify-center text-ui-text-muted">
          No planning found with the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlannings.map((planning) => (
            <PlanningCard
              key={planning.id}
              planning={planning}
              checklist={planning.checklist_items}
              onOpen={(planning) => navigate(`/planning/${planning.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
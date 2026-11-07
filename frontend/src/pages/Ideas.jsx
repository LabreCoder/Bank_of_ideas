import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import { planningApi } from "../services/planning";
import IdeaCard from "../components/Ideas/IdeaCard";
import IdeaFormPanel from "../components/Ideas/IdeaFormPanel";
import IdeaDetailPanel from "../components/Ideas/IdeaDetailPanel";
import IdeaFilterBar from "../components/Filters/IdeaFilterBar";
import NotFoundMessage from "../components/Default/NotFoundMessage";
import { useIdeaFilters } from "../hooks/useIdeaFilters";
import { useGoBack } from "../hooks/useGoBack";
import { matchesIdeaFilters } from "../utils/ideaFilters";

const EXECUTION_STATUS_OPTIONS = ["Free", "In Planning"];

// D02: lista (/ideas), criação (/ideas/new) e detalhe (/ideas/:id) vêm da URL.
export default function Ideas() {
  const { ideaId: ideaParam } = useParams();
  const navigate = useNavigate();
  const { goBack, hasInternalHistory } = useGoBack("/ideas");

  const isCreate = ideaParam === "new";
  const detailId = ideaParam && !isCreate ? Number(ideaParam) : null;
  const invalidParam = Boolean(ideaParam) && !isCreate && !Number.isInteger(detailId);

  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Ideia buscada por id (GET /ideas/{id}) quando a URL é aberta direto.
  const [fetchedIdea, setFetchedIdea] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const listedIdea = detailId ? ideas.find((i) => i.id === detailId) : null;
  const viewingIdea = listedIdea ?? (fetchedIdea?.id === detailId ? fetchedIdea : null);

  useEffect(() => {
    setNotFound(false);
    if (!detailId || listedIdea) return undefined;
    let cancelled = false;
    ideasApi
      .get(detailId)
      .then((idea) => !cancelled && setFetchedIdea(idea))
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 404) setNotFound(true);
        else setError(err.message || "It was not possible to load the idea.");
      });
    return () => {
      cancelled = true;
    };
  }, [detailId, Boolean(listedIdea)]); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtros Locais (padrão: só ideias ativas)
  const [activeTab, setActiveTab] = useState("All");
  const { filters, updateFilter, resetFilters, activeCount } = useIdeaFilters();

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

  // Contadores para as Tabs (respeitam os demais filtros, exceto a própria aba)
  const tabCounts = useMemo(() => {
    const base = ideas.filter((idea) => matchesIdeaFilters(idea, filters));
    const counts = { All: base.length };
    for (const status of EXECUTION_STATUS_OPTIONS) {
      counts[status] = base.filter((idea) => idea.execution_status === status).length;
    }
    return counts;
  }, [ideas, filters]);

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
      return matchesIdeaFilters(idea, filters);
    });
  }, [ideas, activeTab, filters]);

  const handleCreate = async (payload) => {
    const created = await ideasApi.create(payload);
    setIdeas((prev) => [created, ...prev]);
    goBack();
  };

  const handleIdeaUpdated = (updated) => {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setFetchedIdea((current) => (current?.id === updated.id ? updated : current));
  };

  const handleToggleActive = async (idea) => {
    try {
      const updated = await ideasApi.toggleActive(idea.id);
      handleIdeaUpdated(updated);
    } catch (err) {
      setError(err.message || "It was not possible to update the idea status.");
    }
  };

  const handlePlanningUpdated = (updatedPlanning) => {
    setPlannings((prev) => prev.map((p) => (p.id === updatedPlanning.id ? updatedPlanning : p)));
  };

  // ----------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL DA TELA ATUAL
  // ----------------------------------------------------

  if (invalidParam || (detailId && notFound)) {
    return <NotFoundMessage title="Idea not found" listPath="/ideas" listLabel="Ideas" />;
  }

  if (isCreate) {
    return (
      <IdeaFormPanel
        categories={categories}
        owners={owners}
        backLabel={hasInternalHistory ? "Back" : "Ideas"}
        onClose={goBack}
        onSubmit={handleCreate}
      />
    );
  }

  if (detailId) {
    if (!viewingIdea) {
      return (
        <div className="py-20 text-center text-ui-text-muted">{error || "Loading idea..."}</div>
      );
    }
    return (
      <IdeaDetailPanel
        key={viewingIdea.id}
        idea={viewingIdea}
        planning={planningByIdeaId.get(viewingIdea.id) || null}
        planningsLoaded={!loading}
        categories={categories}
        owners={owners}
        backLabel={hasInternalHistory ? "Back" : "Ideas"}
        onClose={goBack}
        onUpdated={handleIdeaUpdated}
        onToggleActive={handleToggleActive}
        onPlanningUpdated={handlePlanningUpdated}
      />
    );
  }

  // Visualização Padrão: Lista de Ideias
  return (
    <div className="animate-fade-in pb-10">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start mb-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ui-text-primary md:text-5xl">
              Ideas
            </h2>
            <p className="mt-3 text-lg text-ui-text-secondary italic">
              A place for every idea. Room for what comes next.
            </p>
          </div>
        </header>
        <button
          onClick={() => navigate("/ideas/new")}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-800 shrink-0"
        >
          + New Idea
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

      {/* Grid de Ideias */}
      {loading ? (
        <div className="text-center text-ui-text-muted py-20">Loading ideas...</div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center text-ui-text-muted py-20">No ideas found with the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onOpen={(i) => navigate(`/ideas/${i.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
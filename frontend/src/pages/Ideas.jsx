import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import { planningApi } from "../services/planning";
import IdeaCard from "../components/Ideas/IdeaCard";
import IdeaFormPanel from "../components/Ideas/IdeaFormPanel";
import IdeaDetailPanel from "../components/Ideas/IdeaDetailPanel";
import IdeaFilterBar from "../components/Filters/IdeaFilterBar";
import { useIdeaFilters } from "../hooks/useIdeaFilters";
import { matchesIdeaFilters } from "../utils/ideaFilters";

const EXECUTION_STATUS_OPTIONS = ["Free", "In Planning"];

export default function Ideas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Quando o formulário é aberto de outra página (ex.: Dashboard), guardamos
  // o nome da origem uma única vez; cancelar ou salvar volta pra lá.
  const [originLabel] = useState(() => location.state?.fromLabel ?? null);

  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controle de Visualização da Tela: "list" | "create" | "detail"
  const [currentView, setCurrentView] = useState(() =>
    searchParams.get("new") === "1" ? "create" : "list"
  );
  const [viewingIdea, setViewingIdea] = useState(null);

  // Remove o ?new=1 da URL (sem criar nova entrada no histórico) pra que um
  // refresh ou um retorno à lista não reabra o formulário.
  useEffect(() => {
    if (searchParams.get("new") !== "1") return;
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true, state: location.state });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const closeCreate = () => {
    if (originLabel) navigate(-1);
    else setCurrentView("list");
  };

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
    closeCreate();
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

  // ----------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL DA TELA ATUAL
  // ----------------------------------------------------

  if (currentView === "create") {
    return (
      <IdeaFormPanel
        categories={categories}
        owners={owners}
        backLabel={originLabel ?? "Ideas"}
        onClose={closeCreate}
        onSubmit={handleCreate}
      />
    );
  }

  if (currentView === "detail" && viewingIdea) {
    return (
      <IdeaDetailPanel
        idea={viewingIdea}
        planning={planningByIdeaId.get(viewingIdea.id) || null}
        categories={categories}
        owners={owners}
        onClose={() => { setViewingIdea(null); setCurrentView("list"); }}
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
          onClick={() => setCurrentView("create")}
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
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {/* Grid de Ideias */}
      {loading ? (
        <div className="text-center text-gray-400 py-20">Loading ideas...</div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center text-gray-400 py-20">No ideas found with the current filters.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onOpen={(i) => { setViewingIdea(i); setCurrentView("detail"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
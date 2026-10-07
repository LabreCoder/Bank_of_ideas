import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { ownersApi } from "../services/owners";
import { planningApi } from "../services/planning";
import IdeaCard from "../components/Ideas/IdeaCard";
import IdeaFormPanel from "../components/Ideas/IdeaFormPanel";
import IdeaDetailPanel from "../components/Ideas/IdeaDetailPanel";
import ToggleSwitch from "../components/Filters/ToggleSwitch";

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

  // Filtros Locais
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [ownerId, setOwnerId] = useState("");
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

  // Contadores para as Tabs
  const tabCounts = useMemo(() => {
    const counts = { All: ideas.length };
    for (const status of EXECUTION_STATUS_OPTIONS) {
      counts[status] = ideas.filter((idea) => idea.execution_status === status).length;
    }
    return counts;
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (activeTab !== "All" && idea.execution_status !== activeTab) return false;
      if (!showInactive && !idea.is_active) return false;
      if (searchQuery && !idea.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (categoryId && idea.category?.id !== Number(categoryId)) return false;
      if (ownerId && idea.owner?.id !== Number(ownerId)) return false;
      return true;
    });
  }, [ideas, activeTab, showInactive, searchQuery, categoryId, ownerId]);

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

  const clearFilters = () => {
    setSearchQuery("");
    setCategoryId("");
    setOwnerId("");
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            Ideas <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2.5 py-0.5 rounded-full">{ideas.length} ideas</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">A place for every idea. Room for what comes next.</p>
        </div>
        <button
          onClick={() => setCurrentView("create")}
          className="bg-[#2D3350] hover:bg-[#1f243b] text-white text-sm font-medium px-4 py-2.5 rounded-md flex items-center gap-2 transition-colors"
        >
          <span className="text-lg leading-none">+</span> New Idea
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-800 mb-6">
        {["All", ...EXECUTION_STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === status
                ? "border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700"
            }`}
          >
            {status} <span className="ml-1.5 text-xs text-gray-400">{tabCounts[status]}</span>
          </button>
        ))}
      </div>

      {/* Filtros em linha */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Searching by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-sm focus:outline-none focus:border-gray-300"
          />
        </div>
        
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full sm:w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2.5 text-sm">
          <option value="">All categories</option>
          {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
        </select>

        <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className="w-full sm:w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md px-3 py-2.5 text-sm">
          <option value="">All owners</option>
          {owners.map((o) => (<option key={o.id} value={o.id}>{o.name}</option>))}
        </select>

        <button onClick={clearFilters} className="text-sm font-medium text-gray-500 hover:text-gray-700 px-2 hidden sm:block">
          Clear Filters
        </button>
      </div>

      {/* Toggle Inativos */}
      <div className="flex justify-end mb-6">
        <ToggleSwitch checked={showInactive} onChange={setShowInactive} label="Show inactive" />
      </div>

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
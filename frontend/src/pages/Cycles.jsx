import { useState, useEffect, useMemo } from "react";
import { cycleApi } from "../services/cycle";
import { planningApi } from "../services/planning";
import CycleTimelineCard from "../components/Cycle/CycleTimelineCard";
import CycleFormModal from "../components/Cycle/CycleFormModal";
import CycleDetailModal from "../components/Cycle/CycleDetailModal";
import CycleFilterBar from "../components/Cycle/Filters/CycleFilterBar";
import { useCycleFilters } from "../hooks/useCycleFilters";
import { applyCycleFilters } from "../utils/cycleFilters";

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

  const { filters, updateFilter, resetFilters } = useCycleFilters();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cyclesData, planningsData] = await Promise.all([
        cycleApi.list(),
        planningApi.list(),
      ]);
      setCycles(cyclesData);
      setPlannings(planningsData);
    } catch (err) {
      setError(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtro e ordenação (padrão: start_date ascendente, efeito de "linha do
  // tempo") são aplicados antes do split. Anteriores fica separado de Em
  // Andamento pra não misturar cycles finalizados com os que ainda rolam;
  // o split preserva a ordem recebida.
  const visibleCycles = useMemo(
    () => applyCycleFilters(cycles, filters),
    [cycles, filters]
  );

  // D09: planningId -> ciclos aos quais ele já pertence (para avisar no vínculo).
  const planningCycleNames = useMemo(() => {
    const map = new Map();
    for (const cycle of cycles) {
      for (const planning of cycle.plannings ?? []) {
        if (!map.has(planning.id)) map.set(planning.id, []);
        map.get(planning.id).push({ id: cycle.id, name: cycle.name });
      }
    }
    return map;
  }, [cycles]);

  const activeCycles = useMemo(
    () => visibleCycles.filter((c) => c.status !== "Finished"),
    [visibleCycles]
  );

  const finishedCycles = useMemo(
    () => visibleCycles.filter((c) => c.status === "Finished"),
    [visibleCycles]
  );

  const handleCreated = (newCycle) => {
    setCycles((prev) => [newCycle, ...prev]);
    setIsCreateOpen(false);
  };

  const handleUpdated = (updatedCycle) => {
    setCycles((prev) =>
      prev.map((c) => (c.id === updatedCycle.id ? updatedCycle : c))
    );
  };

  const handleDeleted = (deletedId) => {
    setCycles((prev) => prev.filter((c) => c.id !== deletedId));
    setSelectedCycle(null);
  };

  const renderTimelineSection = (title, sectionCycles, emptyMessage) => (
    <div className="mb-8">
      <div className="flex items-center justify-between border-b border-ui-border pb-2 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ui-text-muted">
          {title}
        </h3>
        <span className="text-xs text-ui-text-muted">
          {sectionCycles.length} {sectionCycles.length === 1 ? "cycle" : "cycles"}
        </span>
      </div>

      {sectionCycles.length === 0 ? (
        <div className="text-center py-8 bg-ui-surface-2 rounded-lg border border-dashed border-ui-border">
          <p className="text-sm text-ui-text-muted">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-ui-border">
          {sectionCycles.map((cycle) => (
            <div key={cycle.id} className="relative mb-4 last:mb-0">
              <span className="absolute -left-[29px] top-2 w-3 h-3 rounded-full bg-accent-600 ring-4 ring-white" />
              <CycleTimelineCard cycle={cycle} onClick={setSelectedCycle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h2 className="mt-3 text-4xl font-semibold tracking-tight text-ui-text-primary md:text-5xl">
              Cycles
            </h2>
            <p className="mt-3 text-lg text-ui-text-secondary italic">
              Overview of all cycles. Track progress and upcoming deadlines.
            </p>
          </div>
        </header>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-800 shrink-0"
          >
            + New Cycle
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-status-red-bg border border-status-red-border text-status-red-fg text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-ui-text-muted">Loading cycles...</p>
      ) : cycles.length === 0 ? (
        <div className="text-center py-12 bg-ui-surface-2 rounded-lg border border-dashed border-ui-border">
          <p className="text-sm text-ui-text-muted">No cycles created yet.</p>
        </div>
      ) : (
        <>

          <CycleFilterBar
            cycles={cycles}
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
          />

          {visibleCycles.length === 0 ? (
            <div className="text-center py-12 bg-ui-surface-2 rounded-lg border border-dashed border-ui-border">
              <p className="text-sm text-ui-text-muted mb-3">
                No cycles match your filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-medium text-accent-600 hover:text-accent-700"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {renderTimelineSection("On Course", activeCycles, "No cycles currently in progress.")}

              {/* "Previous" section disappears entirely when there are no finished cycles
                  yet — it doesn't make sense to show an empty header. */}
              {finishedCycles.length > 0 &&
                renderTimelineSection("Previous", finishedCycles, "")}
            </>
          )}
        </>
      )}

      {isCreateOpen && (
        <CycleFormModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleCreated}
        />
      )}

      {selectedCycle && (
        <CycleDetailModal
          cycle={selectedCycle}
          availablePlannings={plannings}
          planningCycleNames={planningCycleNames}
          onClose={() => setSelectedCycle(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
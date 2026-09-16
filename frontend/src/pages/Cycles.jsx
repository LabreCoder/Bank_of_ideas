import { useState, useEffect, useMemo } from "react";
import { cycleApi } from "../services/cycle";
import { planningApi } from "../services/planning";
import CyclesSummary from "../components/Cycle/CyclesSummary";
import CycleTimelineCard from "../components/Cycle/CycleTimelineCard";
import CycleFormModal from "../components/Cycle/CycleFormModal";
import CycleDetailModal from "../components/Cycle/CycleDetailModal";

export default function Cycles() {
  const [cycles, setCycles] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);

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

  // Ordenados por start_date ascendente — é o que dá o efeito de "linha do
  // tempo" (mais antigo primeiro). Anteriores fica separado de Em Andamento
  // pra não misturar cycles finalizados com os que ainda estão rolando.
  const activeCycles = useMemo(
    () =>
      cycles
        .filter((c) => c.status !== "Finished")
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [cycles]
  );

  const finishedCycles = useMemo(
    () =>
      cycles
        .filter((c) => c.status === "Finished")
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
    [cycles]
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
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h3>
        <span className="text-xs text-gray-400">
          {sectionCycles.length} {sectionCycles.length === 1 ? "ciclo" : "ciclos"}
        </span>
      </div>

      {sectionCycles.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-gray-200">
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
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-md bg-accent-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-700"
        >
          + New Cycle
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">Loading cycles...</p>
      ) : cycles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No cycles created yet.</p>
        </div>
      ) : (
        <>
          <CyclesSummary cycles={cycles} />

          {renderTimelineSection("Em Andamento", activeCycles, "Nenhum ciclo em andamento.")}

          {/* "Anteriores" some inteira quando não há nenhum cycle finalizado
              ainda — não faz sentido mostrar um cabeçalho vazio. */}
          {finishedCycles.length > 0 &&
            renderTimelineSection("Anteriores", finishedCycles, "")}
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
          onClose={() => setSelectedCycle(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
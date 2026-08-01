import { useState, useMemo, useEffect } from "react";
import { cycleApi } from "../services/cycle";
import { planningApi } from "../services/planning";
import CycleCard from "../components/Cycle/CycleCard";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cycles</h1>
          <p className="text-sm text-gray-500">
            Organize and schedule group plannings within execution windows.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-accent-600 hover:bg-accent-700 text-white text-sm font-medium px-4 py-2 rounded-md"
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
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : cycles.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No cycles created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              onClick={() => setSelectedCycle(cycle)}
            />
          ))}
        </div>
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
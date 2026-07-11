import { useEffect, useMemo, useState } from "react";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import PlanningCard from "../components/PlanningCard";
import PlanningFormModal from "../components/PlanningFormModal";
import PlanningDetailModal from "../components/PlanningDetailModal";

export default function Planning() {
  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailPlanning, setDetailPlanning] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [planningsData, ideasData] = await Promise.all([
        planningApi.list(),
        ideasApi.list(),
      ]);
      setPlannings(planningsData);
      setIdeas(ideasData);
    } catch (err) {
      setError(err.message || "It was not possible to load the plannings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Só ideias "Free" (sem planning) podem ser escolhidas ao criar um novo planning.
  const availableIdeas = useMemo(
    () => ideas.filter((idea) => idea.execution_status === "Free" && idea.is_active),
    [ideas]
  );

  const handleCreate = async (payload) => {
    const created = await planningApi.create(payload);
    setPlannings((prev) => [created, ...prev]);
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === created.idea.id ? { ...idea, execution_status: "In Planning" } : idea
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
    if (removed) {
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Planning</h2>
          <p className="text-gray-500">
            Organize ideas into content plans, track dates and checklist progress.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          + New Planning
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          Loading plannings...
        </div>
      ) : plannings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          No planning created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plannings.map((planning) => (
            <PlanningCard 
              key={planning.id} 
              planning={planning} 
              onOpen={setDetailPlanning} />
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
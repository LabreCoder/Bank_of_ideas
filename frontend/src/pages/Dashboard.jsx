import { useEffect, useMemo, useState } from "react";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import CalendarGrid from "../components/CalendarGrid";
import CalendarLegend from "../components/CalendarLegend";
import DayIdeasModal from "../components/DayIdeasModal";
import DashboardStats from "../components/DashboardStats";

export default function Dashboard() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null); // { key, plannings }

  useEffect(() => {
    const load = async () => {
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
        setError(err.message || "Não foi possível carregar o dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Agrupa plannings por due_date (chave "YYYY-MM-DD"), independente do
  // status de execução/planning — o requisito é mostrar TODA ideia com
  // vencimento marcado, não importa em que fase ela está.
  const dueMap = useMemo(() => {
    const map = new Map();
    for (const planning of plannings) {
      if (!planning.due_date) continue;
      const key = planning.due_date; // já vem como "YYYY-MM-DD" da API
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(planning);
    }
    return map;
  }, [plannings]);

  const handleMonthChange = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleDayClick = (key, ideasDue) => {
    setSelectedDay({ key, plannings: ideasDue });
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1">Dashboard</h2>
        <p className="text-gray-500">
          Track the general indicators and expiration dates of "In Planning" ideas.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-4 h-96 flex items-center justify-center text-gray-400">
          Loading dashboard...
        </div>
      ) : (
        <>
          <DashboardStats ideas={ideas} plannings={plannings} />

          <div className="mb-3">
            <CalendarLegend />
          </div>
          <CalendarGrid
            year={year}
            month={month}
            dueMap={dueMap}
            onMonthChange={handleMonthChange}
            onDayClick={handleDayClick}
          />
        </>
      )}

      {selectedDay && (
        <DayIdeasModal
          dateKey={selectedDay.key}
          plannings={selectedDay.plannings}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
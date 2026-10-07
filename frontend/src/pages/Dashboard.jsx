import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import { cycleApi } from "../services/cycle";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import CalendarLegend from "../components/Calendar/CalendarLegend";
import DayIdeasModal from "../components/Dashboard/DayIdeasModal";
import DashboardHeader from "../components/Dashboard/DashboardHeader";
import KpiStrip from "../components/Dashboard/KpiStrip";
import StageFunnelCard from "../components/Dashboard/StageFunnelCard";
import CategoryBalanceCard from "../components/Dashboard/CategoryBalanceCard";
import ProjectsTable from "../components/Dashboard/ProjectsTable";
import NextDaysCard from "../components/Dashboard/NextDaysCard";
import CollapsibleSection from "../components/Dashboard/CollapsibleSection";
import { buildCategoryColorMap } from "../utils/categoryColors";
import {
  CYCLE_FILTER_ALL,
  buildCategoryBalance,
  buildFunnel,
  buildKpis,
  buildProjectRows,
  filterByCycle,
  getUpcomingDays,
} from "../utils/dashboardMetrics";

const CALENDAR_VIEW_STORAGE_KEY = "content-planner-dashboard-calendar-view";
const CALENDAR_VIEWS = ["month", "week", "day"];

function getInitialCalendarView() {
  const stored = localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY);
  if (CALENDAR_VIEWS.includes(stored)) return stored;
  return "month";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [calendarView, setCalendarView] = useState(getInitialCalendarView);
  const [plannings, setPlannings] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [cycleFilter, setCycleFilter] = useState(CYCLE_FILTER_ALL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    localStorage.setItem(CALENDAR_VIEW_STORAGE_KEY, calendarView);
  }, [calendarView]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [planningsData, ideasData, categoriesData, cyclesData] = await Promise.all([
          planningApi.list(),
          ideasApi.list(),
          categoriesApi.list(),
          cycleApi.list(),
        ]);
        setPlannings(planningsData);
        setIdeas(ideasData);
        setCategories(categoriesData);
        setCycles(cyclesData);
      } catch (err) {
        setError(err.message || "It was not possible to load the dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Cores calculadas a partir da lista completa de categorias, pra não
  // mudarem quando o filtro de cycle reduz os dados exibidos.
  const colorMap = useMemo(() => buildCategoryColorMap(categories), [categories]);
  const ideaById = useMemo(() => new Map(ideas.map((idea) => [idea.id, idea])), [ideas]);

  const scoped = useMemo(
    () => filterByCycle(ideas, plannings, cycles, cycleFilter),
    [ideas, plannings, cycles, cycleFilter]
  );

  const funnel = useMemo(() => buildFunnel(scoped.ideas, scoped.plannings), [scoped]);
  const categoryRows = useMemo(
    () => buildCategoryBalance(scoped.ideas, categories),
    [scoped.ideas, categories]
  );
  const upcomingDays = useMemo(() => getUpcomingDays(scoped.plannings), [scoped.plannings]);
  const kpis = useMemo(
    () => buildKpis(funnel, scoped.plannings, categoryRows, upcomingDays),
    [funnel, scoped.plannings, categoryRows, upcomingDays]
  );
  const projectRows = useMemo(
    () => buildProjectRows(scoped.plannings, ideaById),
    [scoped.plannings, ideaById]
  );

  const dueMap = useMemo(() => {
    const map = new Map();
    for (const planning of scoped.plannings) {
      if (!planning.due_date) continue;
      const key = planning.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(planning);
    }
    return map;
  }, [scoped.plannings]);

  const handleDayClick = (key, dayPlannings) => {
    if (calendarView === "day") return;
    setSelectedDay({ key, plannings: dayPlannings });
  };

  const handleOpenPlanning = (planningId) => {
    navigate(`/planning?planningId=${planningId}`);
  };

  // Reaproveita o formulário de criação da página Ideas. "fromLabel" faz a
  // página Ideas saber que deve voltar pra cá ao cancelar ou salvar.
  const handleNewIdea = () => {
    navigate("/ideas?new=1", { state: { fromLabel: "Dashboard" } });
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        cycles={cycles}
        cycleFilter={cycleFilter}
        onCycleFilterChange={setCycleFilter}
        onNewIdea={handleNewIdea}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-ui-border bg-ui-surface h-96 flex items-center justify-center text-ui-text-muted">
          Loading dashboard...
        </div>
      ) : (
        <>
          <KpiStrip kpis={kpis} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <StageFunnelCard funnel={funnel} colorMap={colorMap} />
            </div>
            <CategoryBalanceCard rows={categoryRows} colorMap={colorMap} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ProjectsTable
                rows={projectRows}
                colorMap={colorMap}
                onOpenPlanning={handleOpenPlanning}
              />
            </div>
            <NextDaysCard
              days={upcomingDays}
              ideaById={ideaById}
              colorMap={colorMap}
              onDayClick={handleDayClick}
              onOpenPlanning={handleOpenPlanning}
            />
          </div>

          <CollapsibleSection title="Full calendar">
            <div className="mb-3">
              <CalendarLegend view={calendarView} />
            </div>
            <CalendarGrid
              anchorDate={anchorDate}
              view={calendarView}
              onViewChange={setCalendarView}
              plannings={scoped.plannings}
              dueMap={dueMap}
              onAnchorDateChange={setAnchorDate}
              onDayClick={handleDayClick}
              onOpenPlanning={handleOpenPlanning}
            />
          </CollapsibleSection>
        </>
      )}

      {selectedDay && (
        <DayIdeasModal
          dateKey={selectedDay.key}
          plannings={selectedDay.plannings}
          view={calendarView}
          onOpenPlanning={handleOpenPlanning}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
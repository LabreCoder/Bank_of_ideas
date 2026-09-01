import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { planningApi } from "../services/planning";
import { ideasApi } from "../services/ideas";
import { categoriesApi } from "../services/categories";
import CalendarGrid from "../components/Calendar/CalendarGrid";
import CalendarLegend from "../components/Calendar/CalendarLegend";
import DayIdeasModal from "../components/Dashboard/DayIdeasModal";
import DashboardStats from "../components/Dashboard/DashboardStats";
import { localDateToKey } from "../utils/calendar";

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
        const [planningsData, ideasData, categoriesData] = await Promise.all([
          planningApi.list(),
          ideasApi.list(),
          categoriesApi.list(),
        ]);
        setPlannings(planningsData);
        setIdeas(ideasData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message || "It was not possible to load the dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const dueMap = useMemo(() => {
    const map = new Map();
    for (const planning of plannings) {
      if (!planning.due_date) continue;
      const key = planning.due_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(planning);
    }
    return map;
  }, [plannings]);

  const handleAnchorDateChange = (nextAnchorDate) => {
    setAnchorDate(nextAnchorDate);
  };

  const handleDayClick = (key, dayPlannings) => {
    if (calendarView === "day") return;
    setSelectedDay({ key, plannings: dayPlannings });
  };

  const handleOpenPlanning = (planningId) => {
    navigate(`/planning?planningId=${planningId}`);
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
          <DashboardStats ideas={ideas} plannings={plannings} categories={categories} />

          <div className="mb-3">
            <CalendarLegend view={calendarView} />
          </div>
          <CalendarGrid
            anchorDate={anchorDate}
            view={calendarView}
            onViewChange={setCalendarView}
            plannings={plannings}
            dueMap={dueMap}
            onAnchorDateChange={handleAnchorDateChange}
            onDayClick={handleDayClick}
            onOpenPlanning={handleOpenPlanning}
          />
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
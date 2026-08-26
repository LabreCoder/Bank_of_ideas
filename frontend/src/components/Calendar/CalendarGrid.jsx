import {
  addDays,
  getPeriodLabel,
  getMonthMatrix,
  getWeekDates,
  shiftAnchorDate,
} from "../../utils/calendar";
import TabBar from "../Filters/TabBar";
import CalendarMonthView from "./CalendarMonthView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarDayView from "./CalendarDayView";

export default function CalendarGrid({
  anchorDate,
  view,
  onViewChange,
  plannings,
  dueMap,
  onAnchorDateChange,
  onDayClick,
  onOpenPlanning,
}) {
  const monthWeeks = getMonthMatrix(anchorDate.getFullYear(), anchorDate.getMonth());
  const weekDates = getWeekDates(anchorDate);
  const dayDate = addDays(anchorDate, 0);

  const viewTabs = [
    { value: "month", label: "Month" },
    { value: "week", label: "Week" },
    { value: "day", label: "Day" },
  ];

  const monthDueMap = dueMap;

  const goPrev = () => onAnchorDateChange(shiftAnchorDate(anchorDate, view, -1));
  const goNext = () => onAnchorDateChange(shiftAnchorDate(anchorDate, view, 1));
  const goToToday = () => onAnchorDateChange(new Date());

  const periodLabel = getPeriodLabel(anchorDate, view);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <TabBar tabs={viewTabs} active={view} onChange={onViewChange} />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{periodLabel}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            ‹
          </button>
          <button
            onClick={goToToday}
            className="text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Today
          </button>
          <button
            onClick={goNext}
            className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>

      {view === "month" && (
        <CalendarMonthView
          weeks={monthWeeks}
          anchorDate={anchorDate}
          dueMap={monthDueMap}
          onDayClick={onDayClick}
        />
      )}
      {view === "week" && (
        <CalendarWeekView weekDates={weekDates} plannings={plannings} onDayClick={onDayClick} />
      )}
      {view === "day" && (
        <CalendarDayView dayDate={dayDate} plannings={plannings} onOpenPlanning={onOpenPlanning} />
      )}
    </div>
  );
}
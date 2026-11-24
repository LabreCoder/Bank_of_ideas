import {
  addDays,
  getPeriodLabel,
  getMonthMatrix,
  getWeekDates,
  shiftAnchorDate,
} from "../../utils/calendar";
import TabBar from "../Filters/TabBar";
import { Button, Card } from "../ui";
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
    <Card>
      <TabBar tabs={viewTabs} active={view} onChange={onViewChange} />

      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="text-lg font-semibold">{periodLabel}</h3>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={goPrev} aria-label="Previous period" title="Previous period">
            <span aria-hidden="true">‹</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="secondary" size="sm" onClick={goNext} aria-label="Next period" title="Next period">
            <span aria-hidden="true">›</span>
          </Button>
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
    </Card>
  );
}
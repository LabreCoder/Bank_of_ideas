import { isSameMonth, isToday, localDateToKey, WEEKDAY_LABELS } from "../../utils/calendar";

function intensityClass(count) {
  if (count >= 3) return "bg-accent-800 text-white";
  if (count === 2) return "bg-accent-500 text-white";
  if (count === 1) return "bg-accent-200 text-accent-700";
  return "";
}

export default function CalendarMonthView({ weeks, anchorDate, dueMap, onDayClick }) {
  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-xs font-medium text-gray-400 text-center py-1">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const key = localDateToKey(date);
          const dayPlannings = dueMap.get(key) || [];
          const inCurrentMonth = isSameMonth(date, anchorDate.getFullYear(), anchorDate.getMonth());
          const today = isToday(date);

          return (
            <button
              key={key}
              onClick={() => dayPlannings.length > 0 && onDayClick(key, dayPlannings)}
              disabled={dayPlannings.length === 0}
              className={`h-14 md:h-16 rounded-md p-1 md:p-1.5 flex flex-col items-start justify-between text-left transition-colors
                ${inCurrentMonth ? "text-gray-700" : "text-gray-300"}
                ${today ? "ring-2 ring-accent-600" : ""}
                ${dayPlannings.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                ${intensityClass(dayPlannings.length)}`}
            >
              <span className="text-xs font-medium">{date.getDate()}</span>
              {dayPlannings.length > 0 && (
                <span className="text-[10px] font-semibold self-end">{dayPlannings.length}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

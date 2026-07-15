import {
  getMonthMatrix,
  isSameMonth,
  isToday,
  localDateToKey,
  WEEKDAY_LABELS,
  MONTH_LABELS,
} from "../../utils/calendar";

// Mesma escala de cores usada na legenda — se ajustar aqui, ajusta lá também.
// Usa só os degraus que existem em tailwind.config.js (100/500/700).
function intensityClass(count) {
  if (count >= 3) return "bg-accent-700 text-white";
  if (count === 2) return "bg-accent-500 text-white";
  if (count === 1) return "bg-accent-100 text-accent-700";
  return "";
}

export default function CalendarGrid({ year, month, dueMap, onMonthChange, onDayClick }) {
  const weeks = getMonthMatrix(year, month);

  const goToPrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    onMonthChange(prev.getFullYear(), prev.getMonth());
  };

  const goToNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  const goToToday = () => {
    const today = new Date();
    onMonthChange(today.getFullYear(), today.getMonth());
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {MONTH_LABELS[month]} {year}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            ‹
          </button>
          <button
            onClick={goToToday}
            className="text-sm px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            Hoje
          </button>
          <button
            onClick={goToNextMonth}
            className="text-sm px-2 py-1 rounded-md border border-gray-200 hover:bg-gray-50"
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="text-xs font-medium text-gray-400 text-center py-1">
            {label}
          </div>
        ))}
      </div>

      {/* Altura fixa (h-14) em vez de aspect-square: numa tela larga, uma
          célula quadrada fica alta o suficiente pra empurrar as 6 semanas
          pra fora da viewport. Como não precisa ser responsivo pra mobile,
          fixar a altura é mais previsível — ajuste h-14 pra h-16/h-20 se
          quiser células mais altas, ou h-12 se ainda não couber na tela. */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const key = localDateToKey(date);
          const ideasDue = dueMap.get(key) || [];
          const inCurrentMonth = isSameMonth(date, year, month);
          const today = isToday(date);

          return (
            <button
              key={key}
              onClick={() => ideasDue.length > 0 && onDayClick(key, ideasDue)}
              disabled={ideasDue.length === 0}
              className={`h-20 rounded-md p-1.5 flex flex-col items-start justify-between text-left transition-colors
                ${inCurrentMonth ? "text-gray-700" : "text-gray-300"}
                ${today ? "ring-2 ring-accent-600" : ""}
                ${ideasDue.length > 0 ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                ${intensityClass(ideasDue.length)}`}
            >
              <span className="text-xs font-medium">{date.getDate()}</span>
              {ideasDue.length > 0 && (
                <span className="text-[10px] font-semibold self-end">{ideasDue.length}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
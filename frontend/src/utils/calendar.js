// Funções puras de data para o calendário.
//
// Ponto de atenção pra estudar (é o bug mais comum em calendários JS):
// `new Date("2026-07-10")` é interpretado como UTC meia-noite. Em
// timezones negativos (como o Brasil, UTC-3), isso pode "voltar" pro dia
// anterior quando exibido localmente. Por isso NUNCA usamos `new Date(string)`
// direto aqui — sempre quebramos a string em ano/mês/dia e construímos a
// data manualmente com `new Date(year, month, day)`, que é sempre local.

import {
  formatLongDate,
  formatMediumDate,
  formatMonthYear,
  formatShortDate,
  getMonthLabels,
  getWeekdayLabels,
} from "./dateFormat.js";

export function dateKeyToLocalDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function localDateToKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function getStartOfWeek(date) {
  const base = startOfDay(date);
  const weekday = base.getDay(); // 0 = Sunday
  return addDays(base, -weekday);
}

export function getWeekDates(anchorDate) {
  const start = getStartOfWeek(anchorDate);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function shiftAnchorDate(anchorDate, view, direction) {
  if (view === "day") return addDays(anchorDate, direction);
  if (view === "week") return addDays(anchorDate, direction * 7);

  // Visão mensal: `setMonth` sobre um dia 29–31 transborda para o mês seguinte
  // (31/jan + 1 mês = 3/mar). Montamos a data no mês de destino e limitamos o
  // dia ao último dia desse mês, preservando o dia quando ele existe (útil ao
  // voltar para as visões de dia/semana).
  const year = anchorDate.getFullYear();
  const targetMonth = anchorDate.getMonth() + direction;
  const lastDayOfTarget = new Date(year, targetMonth + 1, 0).getDate();
  return new Date(year, targetMonth, Math.min(anchorDate.getDate(), lastDayOfTarget));
}

export function getPeriodLabel(anchorDate, view) {
  if (view === "day") return formatLongDate(anchorDate);

  if (view === "week") {
    const weekDates = getWeekDates(anchorDate);
    return `${formatShortDate(weekDates[0])} - ${formatMediumDate(weekDates[6])}`;
  }

  return formatMonthYear(anchorDate);
}

// Gera a matriz de semanas (arrays de 7 dias) pro mês informado, incluindo
// dias do mês anterior/seguinte pra completar as semanas — padrão de
// qualquer calendário em grid.
export function getMonthMatrix(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const startWeekday = firstDayOfMonth.getDay(); // 0 = domingo

  const gridStart = new Date(year, month, 1 - startWeekday);

  const weeks = [];
  let cursor = new Date(gridStart);

  // 6 semanas cobre qualquer mês possível (inclusive fevereiro bissexto
  // caindo numa semana ruim).
  for (let week = 0; week < 6; week++) {
    const days = [];
    for (let day = 0; day < 7; day++) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(days);
  }
  return weeks;
}

export function isSameMonth(date, year, month) {
  return date.getFullYear() === year && date.getMonth() === month;
}

export function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// Rótulos no locale da interface (APP_LOCALE em dateFormat.js).
export const WEEKDAY_LABELS = getWeekdayLabels("short");

export const MONTH_LABELS = getMonthLabels("long");
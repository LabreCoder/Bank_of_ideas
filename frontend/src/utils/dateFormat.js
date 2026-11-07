// Formatação de datas centralizada (D05).
//
// Toda data exibida na interface passa por aqui, com o locale vindo de
// APP_LOCALE. O idioma da interface ainda é uma DECISÃO PENDENTE (pt-BR,
// inglês ou seletor): hoje a interface está em inglês, então o padrão é
// "en-US". Para mudar, basta trocar a constante abaixo.
export const APP_LOCALE = "en-US";

export const NO_DUE_DATE_LABEL = "No due date";

// "YYYY-MM-DD" -> Date local. Nunca usar `new Date("2026-07-10")` direto:
// isso é UTC meia-noite e pode "voltar" um dia em fusos negativos (Brasil, UTC-3).
export function toLocalDate(value) {
  if (value instanceof Date) return value;
  if (!value) return null;
  const [year, month, day] = String(value).slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

export function formatDate(value, options, fallback = "") {
  const date = toLocalDate(value);
  return date ? date.toLocaleDateString(APP_LOCALE, options) : fallback;
}

// "Aug 31" — prazos curtos (cards, tabela, checklist).
export function formatShortDate(value, fallback = NO_DUE_DATE_LABEL) {
  return formatDate(value, { month: "short", day: "2-digit" }, fallback);
}

// "Aug 31, 2026" — datas completas compactas (início/fim de planning).
export function formatMediumDate(value, fallback = "--") {
  return formatDate(value, { month: "short", day: "2-digit", year: "numeric" }, fallback);
}

// "August 31, 2026"
export function formatLongDate(value, fallback = "") {
  return formatDate(value, { month: "long", day: "2-digit", year: "numeric" }, fallback);
}

// "Monday, August 31, 2026"
export function formatFullDate(value, fallback = "") {
  return formatDate(
    value,
    { weekday: "long", month: "long", day: "2-digit", year: "numeric" },
    fallback
  );
}

// "Mon" / "Monday"
export function formatWeekday(value, style = "short") {
  return formatDate(value, { weekday: style });
}

// "August 2026" / "Aug 26"
export function formatMonthYear(value, { month = "long", year = "numeric" } = {}) {
  return formatDate(value, { month, year });
}

// Rótulos dos dias da semana começando no domingo (índice = Date#getDay()).
export function getWeekdayLabels(style = "short") {
  // 2026-11-01 é um domingo.
  return Array.from({ length: 7 }, (_, i) => formatWeekday(new Date(2026, 10, 1 + i), style));
}

// Nomes dos meses (índice = Date#getMonth()).
export function getMonthLabels(style = "long") {
  return Array.from({ length: 12 }, (_, i) => formatDate(new Date(2026, i, 1), { month: style }));
}

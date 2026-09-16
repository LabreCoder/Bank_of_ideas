// Formata uma data "YYYY-MM-DD" como "31 ago" (dia + mês abreviado, pt-BR).
//
// Mesmo cuidado que já existe em utils/calendar.js: nunca usar
// `new Date(dateString)` direto — isso é interpretado como UTC meia-noite
// e pode "voltar" um dia em timezones negativos (Brasil, UTC-3). Por isso
// a string é quebrada manualmente antes de construir a Date localmente.
export function formatShortDate(dateString) {
  if (!dateString) return "Sem prazo";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

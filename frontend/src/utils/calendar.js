// Funções puras de data para o calendário.
//
// Ponto de atenção pra estudar (é o bug mais comum em calendários JS):
// `new Date("2026-07-10")` é interpretado como UTC meia-noite. Em
// timezones negativos (como o Brasil, UTC-3), isso pode "voltar" pro dia
// anterior quando exibido localmente. Por isso NUNCA usamos `new Date(string)`
// direto aqui — sempre quebramos a string em ano/mês/dia e construímos a
// data manualmente com `new Date(year, month, day)`, que é sempre local.

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

export const WEEKDAY_LABELS = ["Sun", "Mon", "Thu", "Wed", "Tue", "Fri", "Sat"];

export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
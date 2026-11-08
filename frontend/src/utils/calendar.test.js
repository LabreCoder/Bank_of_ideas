// Testes das funções puras de data (C01).
// Rodam com o test runner nativo do Node, sem dependências extras:
//   docker compose exec frontend npm test
import { test } from "node:test";
import assert from "node:assert/strict";

import { shiftAnchorDate, localDateToKey } from "./calendar.js";

const key = (y, m, d) => localDateToKey(new Date(y, m, d));
const shift = (y, m, d, dir) => localDateToKey(shiftAnchorDate(new Date(y, m, d), "month", dir));

test("month view: next month never skips a month (days 29-31)", () => {
  assert.equal(shift(2026, 0, 31, 1), key(2026, 1, 28)); // 31 jan -> fev (não março)
  assert.equal(shift(2028, 0, 31, 1), key(2028, 1, 29)); // ano bissexto
  assert.equal(shift(2026, 0, 29, 1), key(2026, 1, 28));
  assert.equal(shift(2026, 4, 31, 1), key(2026, 5, 30)); // 31 mai -> 30 jun
});

test("month view: previous month never skips a month", () => {
  assert.equal(shift(2026, 2, 31, -1), key(2026, 1, 28)); // 31 mar -> fev
  assert.equal(shift(2026, 0, 31, -1), key(2025, 11, 31)); // vira o ano
});

test("month view: walking 12 months visits every month once", () => {
  let date = new Date(2026, 0, 31);
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(date.getMonth());
    date = shiftAnchorDate(date, "month", 1);
  }
  assert.deepEqual(months, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(date.getFullYear(), 2027);
});

test("day and week views are unchanged", () => {
  assert.equal(localDateToKey(shiftAnchorDate(new Date(2026, 0, 31), "day", 1)), key(2026, 1, 1));
  assert.equal(localDateToKey(shiftAnchorDate(new Date(2026, 0, 31), "week", -1)), key(2026, 0, 24));
});

// D05 — rótulos de período passam pelo utilitário central (locale único).
import { getPeriodLabel, WEEKDAY_LABELS, MONTH_LABELS } from "./calendar.js";
import { APP_LOCALE, formatShortDate, NO_DUE_DATE_LABEL } from "./dateFormat.js";

test("date labels come from dateFormat (APP_LOCALE)", () => {
  assert.equal(APP_LOCALE, "en-US");
  assert.equal(getPeriodLabel(new Date(2026, 0, 31), "month"), "January 2026");
  assert.equal(getPeriodLabel(new Date(2026, 0, 31), "day"), "January 31, 2026");
  assert.equal(getPeriodLabel(new Date(2026, 0, 31), "week"), "Jan 25 - Jan 31, 2026");
  assert.deepEqual(WEEKDAY_LABELS, ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  assert.equal(MONTH_LABELS[11], "December");
  assert.equal(formatShortDate("2026-07-12"), "Jul 12"); // antes: "(2026-07-12)" cru no checklist
  assert.equal(formatShortDate(null), NO_DUE_DATE_LABEL);
});

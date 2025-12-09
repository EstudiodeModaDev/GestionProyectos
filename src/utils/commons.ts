import { TZDate } from "@date-fns/tz";
import { isSaturday, isSunday } from "date-fns";
import type { Holiday } from "festivos-colombianos";

export const esc = (s: string) => String(s).replace(/'/g, "''");

const sliceYMD = (s?: string) => (s ? s.slice(0, 10) : "");

export const isHoliday = (date: Date, holidays: Holiday[]) => {
  const ymd = toYMD(date);
  return holidays.some(h =>
    sliceYMD(h.holiday) === ymd || sliceYMD(h.celebrationDay) === ymd
  );
};

const toYMD = (d: Date) => {
  const dd = new Date(d);
  dd.setHours(12, 0, 0, 0);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export function calcularFechaSolucionPorDias(apertura: Date, diasAns: number, holidays: Holiday[]): TZDate {
  const TIMEZONE = "America/Bogota";

  let restante = diasAns;
  let actual = new TZDate(apertura, TIMEZONE);

  while (restante > 0) {
    actual = new TZDate(actual.getFullYear(), actual.getMonth(), actual.getDate() + 1, actual.getHours(), actual.getMinutes(), actual.getSeconds(), TIMEZONE);

    if (isSaturday(actual) || isSunday(actual) || isHoliday(actual, holidays)) {
      continue;
    }

    restante--;
  }

  console.log("Fecha de solución (días hábiles):", actual);
  return actual;
}
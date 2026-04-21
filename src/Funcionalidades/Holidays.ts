import holidaysColombia, { type Holiday } from "festivos-colombianos";

/**
 * Obtiene los festivos de Colombia para el año actual.
 * @returns Colección de festivos disponible para cálculos de agenda.
 */
export async function fetchHolidays(): Promise<Holiday[]> {
  const year = new Date().getFullYear();
  const holidays = holidaysColombia(year);
  return holidays;
}

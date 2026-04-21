import type { Holiday } from "festivos-colombianos";
import { TZDate } from "@date-fns/tz";
import { isSaturday, isSunday } from "date-fns";
import { isHoliday } from "../../../utils/Date";

const TIMEZONE = "America/Bogota";

/**
 * Calcula una fecha de solución sumando solo días hábiles.
 * @param apertura - Fecha inicial desde la que comienza el cálculo.
 * @param diasAns - Cantidad de días hábiles a sumar.
 * @param holidays - Festivos que deben excluirse del conteo.
 * @returns Fecha final calculada.
 */
export function calcularFechaSolucionPorDias(
  apertura: Date,
  diasAns: number,
  holidays: Holiday[]
): TZDate {
  let restante = diasAns;
  let actual = new TZDate(apertura, TIMEZONE);

  while (restante > 0) {
    actual = new TZDate(
      actual.getFullYear(),
      actual.getMonth(),
      actual.getDate() + 1,
      actual.getHours(),
      actual.getMinutes(),
      actual.getSeconds(),
      TIMEZONE
    );

    if (isSaturday(actual) || isSunday(actual) || isHoliday(actual, holidays)) {
      continue;
    }

    restante--;
  }

  return actual;
}

/**
 * Calcula una fecha de solución sumando días calendario consecutivos.
 * @param apertura - Fecha inicial desde la que parte el conteo.
 * @param diasAns - Cantidad de días calendario a sumar.
 * @returns Fecha resultante.
 */
export function calcularFechaSolucionDiasCalendario(
  apertura: Date,
  diasAns: number
): TZDate {
  let restante = diasAns;
  let actual = new TZDate(apertura, TIMEZONE);

  while (restante > 0) {
    actual = new TZDate(
      actual.getFullYear(),
      actual.getMonth(),
      actual.getDate() + 1,
      actual.getHours(),
      actual.getMinutes(),
      actual.getSeconds(),
      TIMEZONE
    );

    restante--;
  }

  return actual;
}

/**
 * Calcula la fecha objetivo de una tarea según su tipo de conteo.
 * @param diasParaResolver - Cantidad de días a sumar.
 * @param fechaInicio - Fecha de inicio del cálculo.
 * @param holidays - Festivos a considerar.
 * @param diasHabiles - Indica si el conteo debe excluir fines de semana y festivos.
 * @returns Fecha final calculada.
 */
export function calcularFechaTareaBase(
  diasParaResolver: number | string,
  fechaInicio: Date,
  holidays: Holiday[],
  diasHabiles: boolean
): TZDate {
  const base = new TZDate(fechaInicio, TIMEZONE);
  const dias = Number(diasParaResolver) || 0;

  return diasHabiles
    ? calcularFechaSolucionPorDias(base, dias, holidays)
    : calcularFechaSolucionDiasCalendario(base, dias);
}

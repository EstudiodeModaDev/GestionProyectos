import type { TZDate } from "@date-fns/tz";
import type { Holiday } from "festivos-colombianos";

/**
 * Normaliza un valor de fecha a un string compatible con Microsoft Graph.
 *
 * La funcion acepta instancias de `Date`, objetos que implementen
 * `toISOString`, cadenas de texto o valores nulos. Si recibe una cadena con
 * formato `YYYY-MM-DD` o una fecha ISO valida, la devuelve tal como esta.
 * Cuando el valor puede convertirse a una fecha valida, retorna su
 * representacion ISO. Si el dato no existe o no puede interpretarse como una
 * fecha valida, retorna `undefined`.
 *
 * @param v Valor de fecha que se desea convertir al formato esperado por Graph.
 * @returns Un string ISO o `undefined` cuando el valor no es utilizable.
 */
export function toGraphDateTime(v: Date | { toISOString: () => string } | string | null | undefined): string | undefined {
  if (!v) return undefined;

  // Si ya viene string ISO/fecha válida, respétalo
  if (typeof v === "string") {
    // "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss(.sss)Z"
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  // TZDate, Date u objeto con toISOString()
  try {
    const iso = (v as any).toISOString?.();
    if (typeof iso === "string" && iso) return iso;
  } catch {}

  const d = new Date(v as any);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/**
 * Formatea una fecha para mostrarla con fecha y hora en configuracion local.
 *
 * Convierte el valor recibido a un objeto `Date` y lo presenta con el locale
 * `es-CO`, incluyendo dia, mes, anio, hora y minuto en formato de 24 horas.
 * Si ocurre un error durante el proceso, retorna `N/A` como valor de respaldo.
 *
 * @param fecha Fecha en texto que se desea mostrar al usuario.
 * @returns La fecha formateada para presentacion o `N/A` si no puede
 * procesarse.
 */
export function ParseDateTimeShow(fecha: string){
  try{
    const fechaParse = new Date(fecha)
    const shortDate = fechaParse.toLocaleString("es-CO", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false});
    return shortDate
  }catch{
    return "N/A"
  }
}

/**
 * Formatea una fecha para mostrar solo su componente calendario.
 *
 * Convierte la cadena recibida a un objeto `Date` y la renderiza con el locale
 * `es-CO`, incluyendo unicamente dia, mes y anio. Si ocurre un error durante
 * el formateo, retorna `N/A`.
 *
 * @param fecha Fecha en texto que se desea presentar sin hora.
 * @returns La fecha formateada para interfaz o `N/A` si no puede procesarse.
 */
export function ParseDateShow(fecha: string){
  try{
    const fechaParse = new Date(fecha)
    const shortDate = fechaParse.toLocaleString("es-CO", {day: "2-digit", month: "2-digit", year: "numeric",});
    return shortDate
  }catch{
    return "N/A"
  }
}

/**
 * Extrae la porcion `YYYY-MM-DD` de una fecha serializada como texto.
 *
 * Se usa como helper interno para comparar fechas ignorando la parte horaria.
 *
 * @param s Fecha serializada que puede incluir hora.
 * @returns Los primeros 10 caracteres de la fecha o una cadena vacia si no se
 * recibe valor.
 */
export function sliceYMD(s?: string){
  return s ? s.slice(0, 10) : ""
};

/**
 * Convierte una fecha al formato `YYYY-MM-DD`.
 *
 * Antes de serializar la fecha, fija la hora al mediodia para reducir
 * problemas derivados de conversiones horarias al crear una nueva instancia de
 * `Date`.
 *
 * @param d Fecha que se desea normalizar.
 * @returns La representacion de la fecha en formato anio-mes-dia.
 */
const toYMD = (d: Date) => {
  const dd = new Date(d);
  dd.setHours(12, 0, 0, 0);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/**
 * Determina si una fecha corresponde a un festivo colombiano.
 *
 * La comparacion se realiza usando el formato `YYYY-MM-DD` para evitar
 * diferencias por zona horaria u hora del dia. La fecha se contrasta tanto con
 * la fecha original del festivo como con su dia de celebracion trasladado.
 *
 * @param date Fecha que se desea validar.
 * @param holidays Listado de festivos disponibles para la comparacion.
 * @returns `true` si la fecha coincide con un festivo o su dia de celebracion;
 * en caso contrario, `false`.
 */
export const isHoliday = (date: Date, holidays: Holiday[]) => {
  const ymd = toYMD(date);
  return holidays.some(h =>
    sliceYMD(h.holiday) === ymd || sliceYMD(h.celebrationDay) === ymd
  );
};

export const toSupabaseDate = (d: Date | TZDate) => {
  const dd = new Date(d);
  dd.setHours(12, 0, 0, 0);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
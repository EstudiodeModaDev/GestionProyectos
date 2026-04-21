import { ParseDateShow } from "../../../utils/Date";

/**
 * Normaliza una fecha para mostrarla en notificaciones.
 *
 * Si la fecha está vacía o no puede parsearse correctamente, devuelve
 * un texto de respaldo para evitar valores inválidos en el correo.
 *
 * @param value - Fecha en formato texto.
 * @returns Fecha formateada o `Sin fecha` si no es válida.
 */
export function safeDateLabel(value?: string | null): string {
  const text = (value ?? "").trim();
  if (!text) return "Sin fecha";

  const parsed = ParseDateShow(text);
  return parsed && parsed !== "Invalid Date" ? parsed : "Sin fecha";
}

/**
 * Escapa comillas simples dentro de una cadena.
 *
 * Esta utilidad duplica cada comilla simple para que el valor pueda usarse
 * con seguridad en contextos donde ese caracter tiene significado especial,
 * como filtros o consultas de texto.
 *
 * @param s Texto que se desea sanear.
 * @returns La cadena con las comillas simples escapadas.
 */
export const esc = (s: string) => String(s).replace(/'/g, "''");


/**
 * Normaliza un valor de texto para comparaciones insensibles a formato.
 *
 * Convierte valores nulos o indefinidos en cadena vacia, elimina espacios al
 * inicio y al final, y transforma el contenido a minusculas.
 *
 * @param s Valor que se desea normalizar.
 * @returns La representacion textual normalizada del valor recibido.
 */
export const normalize = (s: any) => String(s ?? "").trim().toLowerCase();

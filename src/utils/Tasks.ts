import type { projectTasks, TemplateTasks } from "../models/AperturaTienda";

/**
 *
 * La funcion recorre la lista de tareas del proyecto o de plantillas,
 * identifica los valores de `Codigo` que empiezan con el prefijo `T`,
 * extrae su parte numerica y calcula el siguiente consecutivo disponible.
 *
 * Los codigos que no sean cadenas validas, que no empiecen por `T` o cuya
 * porcion numerica no pueda convertirse en un numero entero se descartan del
 * calculo. Si no existe ningun codigo valido, la secuencia comienza en `T1`.
 *
 * @param rows Coleccion de tareas existentes desde la que se obtiene el mayor
 * codigo numerico registrado.
 * @returns El siguiente codigo de tarea con formato `T<n>`.
 */
export function getNextTaskCode(rows: projectTasks[] | TemplateTasks[]): string {
  const prefix = "T";

  const numbers = rows
    .map((t) => t.Codigo) //Mapea el codigo de cada Row
    .filter((c): c is string => typeof c === "string" && c.startsWith(prefix)) //Dejar todos los codigos que inician por T..
    .map((c) => parseInt(c.slice(prefix.length), 10)) //Elimina la T y deja como Int el numero
    .filter((n) => !Number.isNaN(n));  //Descarta todas las opciones que en los pasos anteriores no hayan quedado como INT

  const max = numbers.length ? Math.max(...numbers) : 0;
  const next = max + 1;

  return `T${next}`;
}


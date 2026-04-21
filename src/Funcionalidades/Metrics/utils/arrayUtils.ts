/**
 * Divide un arreglo en grupos consecutivos de tamaño fijo.
 * @typeParam T - Tipo de los elementos del arreglo.
 * @param items - Colección de elementos a segmentar.
 * @param size - Tamaño máximo de cada bloque.
 * @returns Arreglo de bloques resultantes.
 */
export const chunk = <T,>(items: T[], size: number) => {
  const result: T[][] = [];

  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }

  return result;
};

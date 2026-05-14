import * as React from "react";
import type { useResponsableRulesRepository } from "./useResponsableRulesRepository";
import type { responsableReglaTareaDetalle } from "../../models/responsables";

type ResponsibleCandidate = Omit<responsableReglaTareaDetalle, "id" | "regla_id">;

/**
 * Detecta si un nombre funciona como marcador para resolución por jefe de zona.
 * @param nombre - Nombre configurado en el detalle de la regla.
 * @returns `true` cuando debe resolverse dinámicamente por jefe de zona.
 */
function isJefeZonaMarker(nombre?: string | null) {
  const n = (nombre ?? "").trim().toLowerCase();
  return n === "jefe de zona" || n.includes("jefe de zona");
}

/**
 * Resuelve responsables concretos a partir de reglas configuradas.
 * @param rulesRepo - Repositorio de reglas y detalles.
 * @returns Operación para resolver responsables finales de una tarea.
 */
export function useResponsableResolver(rulesRepo: ReturnType<typeof useResponsableRulesRepository>) {
  /**
   * Resuelve los responsables efectivos para una tarea según marca y zona.
   * @param args - Datos mínimos del contexto de resolución.
   * @returns Responsables deduplicados que deben asignarse a la tarea.
   */
  const resolve = React.useCallback(
    async (args: { tarea: number; marca: number; zona: number }): Promise<ResponsibleCandidate[]> => {
      const { tarea, marca, zona } = args;
      if (!tarea || !marca) return [];

      const reglas = await rulesRepo.getReglas(marca, tarea);
      console.log(reglas)
      if (!reglas?.length) return [];

      const reglaEspecifica = reglas.find((r) => (Number(r.id_zona ?? 0) === (zona ?? 0)));
      const reglaDefault = reglas.find((r) => !r.id_zona || (r.id_zona) === null);
      const regla = reglaEspecifica ?? reglaDefault;

      if (!regla?.id) return [];

      const detalles = await rulesRepo.getDetalles(regla.id);
      if (!detalles?.length) return [];

      const tieneJefeZona = detalles.some((d) => isJefeZonaMarker(d.nombre));

      if (tieneJefeZona) {
        const jefes = await rulesRepo.getJefeZona(String(marca), String(zona));

        if (!Array.isArray(jefes) || jefes.length === 0) return [];

        return jefes
          .map((jefe) => ({
            nombre: jefe.jefe_nombre ?? "Jefe de zona",
            correo: jefe.jefe_correo ?? "",
          }) as ResponsibleCandidate)
          .filter((x) => x.correo.trim() !== "");
      }

      const seen = new Set<string>();
      return detalles
        .filter((d) => !isJefeZonaMarker(d.nombre))
        .map((d) => ({ nombre: d.nombre, correo: d.correo } as ResponsibleCandidate))
        .filter((x) => {
          const k = (x.correo ?? "").trim().toLowerCase();
          if (!k) return false;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        });
    },
    [rulesRepo]
  );

  return { resolve };
}

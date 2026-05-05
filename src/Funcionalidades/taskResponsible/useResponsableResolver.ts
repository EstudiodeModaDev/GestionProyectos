import * as React from "react";
import type { useResponsableRulesRepository } from "./useResponsableRulesRepository";
import type { taskResponsible } from "../../models/AperturaTienda";

type ResponsibleCandidate = Omit<taskResponsible, "Id" | "IdTarea" | "reglaId">;

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
    async (args: { codigoTarea: string; marca: string; zona: string }): Promise<ResponsibleCandidate[]> => {
      const { codigoTarea, marca, zona } = args;
      if (!codigoTarea || !marca) return [];

      const reglas = await rulesRepo.getReglas(marca, codigoTarea);
      console.log(reglas)
      if (!reglas?.length) return [];

      const reglaEspecifica = reglas.find((r) => (r.Ciudad ?? "").trim() === (zona ?? "").trim());
      const reglaDefault = reglas.find((r) => !r.Ciudad || (r.Ciudad ?? "").trim() === "");
      const regla = reglaEspecifica ?? reglaDefault;
      if (!regla?.Id) return [];

      const detalles = await rulesRepo.getDetalles(regla.Id);
      if (!detalles?.length) return [];

      const tieneJefeZona = detalles.some((d) => isJefeZonaMarker(d.Nombre));

      if (tieneJefeZona) {
        const jefes = await rulesRepo.getJefeZona(marca, zona);

        if (!Array.isArray(jefes) || jefes.length === 0) return [];

        return jefes
          .map((jefe) => ({
            Title: jefe.JefeNombre ?? "Jefe de zona",
            Correo: jefe.JefeCorreo ?? "",
          }) as ResponsibleCandidate)
          .filter((x) => x.Correo.trim() !== "");
      }

      const seen = new Set<string>();
      return detalles
        .filter((d) => !isJefeZonaMarker(d.Nombre))
        .map((d) => ({ Title: d.Nombre, Correo: d.Correo } as ResponsibleCandidate))
        .filter((x) => {
          const k = (x.Correo ?? "").trim().toLowerCase();
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

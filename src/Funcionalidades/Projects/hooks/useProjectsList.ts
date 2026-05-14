import * as React from "react";
import type { ProjectSP } from "../../../models/Projects";
import type { ProjectRepository } from "../../../repositories/ProjectRepository/ProjectRepository";

/**
 * Administra la colección de proyectos y su estado de carga.
 * @param proyectosSvc - Servicio de acceso a datos de proyectos.
 * @returns Lista de proyectos y operaciones de recarga.
 */
export function useProjectsList(proyectosSvc: ProjectRepository) {
  const [rows, setRows] = React.useState<ProjectSP[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Carga todos los proyectos disponibles.
   * @returns Colección completa de proyectos.
   */
  const loadAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await proyectosSvc.loadProjects();
      setRows(items);
      return items;
    } catch (e: any) {
      setRows([]);
      setError(e?.message ?? "Error cargando proyectos");
      return [];
    } finally {
      setLoading(false);
    }
  }, [proyectosSvc]);

  return { rows, loading, error, loadAll, setRows };
}

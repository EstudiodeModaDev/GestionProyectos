import * as React from "react";
import type { ProjectSP } from "../../../models/Projects";
import type { ProjectRepository } from "../../../repositories/ProjectRepository/ProjectRepository";

/**
 * Centraliza las acciones de escritura sobre proyectos.
 * @param proyectosSvc - Servicio de acceso a datos de proyectos.
 * @returns Estado de guardado y operaciones de creación/actualización.
 */
export function useProjectActions(proyectosSvc: ProjectRepository) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Crea un nuevo proyecto.
   * @param payload - Datos del proyecto a crear.
   * @returns Proyecto creado.
   */
  const createProject = React.useCallback(
    async (payload: ProjectSP) => {
      setSaving(true);
      setError(null);
      try {
        return await proyectosSvc.createProject(payload);
      } catch (e: any) {
        setError(e?.message ?? "Error creando proyecto");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [proyectosSvc]
  );

  /**
   * Cambia el nombre de un proyecto existente.
   * @param id - Identificador del proyecto.
   * @param newTitle - Nuevo nombre del proyecto.
   * @returns Proyecto actualizado.
   */
  const changeName = React.useCallback(
    async (id: string, newTitle: string) => {
      setSaving(true);
      setError(null);
      try {
        return await proyectosSvc.updateProject(id, { nombre_proyecto: newTitle });
      } catch (e: any) {
        setError(e?.message ?? "Error actualizando nombre");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [proyectosSvc]
  );

  /**
   * Marca un proyecto como cancelado.
   * @param id - Identificador del proyecto.
   * @returns Proyecto actualizado.
   */
  const archiveProject = React.useCallback(
    async (id: string) => {
      setSaving(true);
      setError(null);
      try {
        return await proyectosSvc.updateProject(id, { estado: "Cancelado" });
      } catch (e: any) {
        setError(e?.message ?? "Error archivando proyecto");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [proyectosSvc]
  );

  /**
   * Actualiza el porcentaje de progreso de un proyecto.
   * @param id - Identificador del proyecto.
   * @param porcentaje - Nuevo porcentaje de avance.
   */
  const updatePorcentaje = React.useCallback(
    async (id: string, porcentaje: number) => {
      setSaving(true);
      setError(null);
      try {
        await proyectosSvc.updateProject(id, { progreso: porcentaje });
        if (porcentaje === 100) {
          await proyectosSvc.updateProject(id, { estado: "Completado" });
        }
      } catch (e: any) {
        setError(e?.message ?? "Error actualizando progreso");
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [proyectosSvc]
  );

  return { saving, error, createProject, changeName, archiveProject, updatePorcentaje };
}

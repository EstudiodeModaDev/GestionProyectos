import * as React from "react";
import type { ProyectosServices } from "../../../services/Projets.service";
import { useProjectActions } from "./useProjectActions";
import { useProjectForm } from "./useProjectForm";
import { useProjectsList } from "./useProjectsList";

/**
 * Fachada principal del dominio de proyectos.
 * @param proyectosSvc - Servicio de acceso a datos de proyectos.
 * @returns Estado consolidado, formulario, acciones y recarga de proyectos.
 */
export function useProjects(proyectosSvc: ProyectosServices) {
  const [search, setSearch] = React.useState("");
  const list = useProjectsList(proyectosSvc);
  const form = useProjectForm();
  const actions = useProjectActions(proyectosSvc);

  React.useEffect(() => {
    void list.loadAll();
  }, [list.loadAll]);

  /**
   * Envía el formulario y recarga la lista al crear un proyecto.
   * @param e - Evento del formulario.
   * @returns Proyecto creado.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = form.buildCreatePayload();
    const created = await actions.createProject(payload);
    return created;
  };

  return {
    rows: list.rows,
    loading: list.loading || actions.saving,
    error: list.error ?? actions.error,
    search,
    setSearch,
    state: form.state,
    setField: form.setField,
    resetForm: form.reset,
    handleSubmit,
    changeName: actions.changeName,
    archiveProject: actions.archiveProject,
    updatePorcentaje: actions.updatePorcentaje,
    loadAll: list.loadAll,
  };
}

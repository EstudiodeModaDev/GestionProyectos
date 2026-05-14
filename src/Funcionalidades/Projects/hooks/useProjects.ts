import * as React from "react";
import { useProjectActions } from "./useProjectActions";
import { useProjectForm } from "./useProjectForm";
import { useProjectsList } from "./useProjectsList";
import { useRepositories } from "../../../repositories/repositoriesContext";

/**
 * Fachada principal del dominio de proyectos.
 * @param proyectosSvc - Servicio de acceso a datos de proyectos.
 * @returns Estado consolidado, formulario, acciones y recarga de proyectos.
 */
export function useProjects() {
  const repositories = useRepositories()
  const [search, setSearch] = React.useState("");
  const list = useProjectsList(repositories.projects!);
  const form = useProjectForm();
  const actions = useProjectActions(repositories.projects!);

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

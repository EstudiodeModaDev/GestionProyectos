import * as React from "react";
import type { TemplateTasks } from "../../models/AperturaTienda";
import { useTemplateTasksRepository } from "./useTemplateTasksRepository";
import { useAsyncStatus } from "../commons/useAsyncStatus";
import { useTemplateForm } from "./useTemplateTaksForm";
import { useTemplateTasksModification } from "./useTemplateTasksModification";
import type { TemplateTaskRepository } from "../../repositories/templateTaskRepository/templateTaskRepository";

/**
 * Orquesta la gestión de tareas plantilla.
 * @param templateTasksSvc - Servicio de acceso a tareas plantilla.
 * @returns Estado, formulario y operaciones principales del módulo.
 */
export function useTemplateTaks(templateTasksSvc: TemplateTaskRepository) {
  const repo = useTemplateTasksRepository(templateTasksSvc);
  const listStatus = useAsyncStatus();
  const status = useAsyncStatus();
  const [templateTasks, setTemplateTasks] = React.useState<TemplateTasks[]>([]);
  const form = useTemplateForm();
  const modification = useTemplateTasksModification(templateTasksSvc);

  /**
   * Carga todas las tareas de la plantilla.
   */
  const loadTemplateTasks = React.useCallback(async (): Promise<TemplateTasks[]> => {
    status.start();
    try {
      const template = await repo.loadTasks();
      console.log("Tareas plantilla cargadas:", template);
      setTemplateTasks(template);
      return template;
    } catch (e) {
      status.fail(e, "Error cargando tareas plantilla");
      return [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  /**
   * Crea una tarea plantilla con los valores actuales del formulario.
   */
  const createTemplateTask = React.useCallback(async (): Promise<void> => {
    listStatus.start();
    try {
      const payload = form.createPayload(form.state);
      await modification.handleSubmit(payload);
      await repo.loadTasks();
    } catch (e) {
      listStatus.fail(e, "Error creando la tarea, por favor intentelo de nuevo");
    } finally {
      listStatus.stop();
    }
  }, [repo, listStatus]);

  /**
   * Edita una tarea plantilla existente.
   * @param IdTask - Identificador de la tarea a actualizar.
   */
  const editTemplateTask = React.useCallback(async (IdTask: string) => {
    listStatus.start();
    try {
      const payload = form.createPayload(form.state);
      await modification.handleEdit(IdTask, payload);
      await repo.loadTasks();
    } catch (e) {
      listStatus.fail(e, "Error actualizando la tarea");
    } finally {
      listStatus.stop();
    }
  }, [repo, listStatus]);

  /**
   * Elimina una tarea plantilla.
   * @param IdTask - Identificador de la tarea a eliminar.
   */
  const deleteTemplateTask = React.useCallback(async (IdTask: string) => {
    listStatus.start();
    try {
      await modification.handleDelete(IdTask);
      await repo.loadTasks();
    } catch (e) {
      listStatus.fail(e, "Error eliminando la tarea");
    } finally {
      listStatus.stop();
    }
  }, [repo, listStatus]);

  return {
    templateTasks,
    status,
    loadTemplateTasks,
    createTemplateTask,
    editTemplateTask,
    deleteTemplateTask,
    ...form,
    ...repo,
    loading: listStatus.loading,
    error: listStatus.error,
  };
}

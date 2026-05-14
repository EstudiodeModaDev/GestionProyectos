import * as React from "react";
import type { TemplateTasks, projectTasks } from "../../../models/AperturaTienda";
import type { ProjectSP } from "../../../models/Projects";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { toSupabaseDate } from "../../../utils/Date";
import { getProjectTaskProjectId, getProjectTaskTemplateId } from "../../../utils/projectTasks";
import { useAuth } from "../../../auth/authProvider";
import { useGraphServices } from "../../../graph/graphContext";
import { useAsyncStatus } from "../../commons/useAsyncStatus";
import { useHolidays } from "../../commons/useHolidays";
import { useNotifications } from "../../Notifications/Notification";
import { useProjects } from "../../Projects/useProjects";
import { useReglasFlujo } from "../../Reglas/useTaskFlowRules";
import { createTaskLog } from "../../TaskLog/taskLogActions";
import { useResponsablesTarea } from "../../taskResponsible/useResponsableTarea";
import { useTaskAssignments } from "../../taskResponsible/useTaskAssignments";
import { useTaskCriticalPaths } from "./useTaskCriticalPaths";
import { useTaskDates } from "./useTaskDates";
import { useTaskFilters } from "./useTaskFilters";
import { useTaskForm } from "./useTaskForm";
import { useTaskProgress } from "./useTaskProgress";
import { useTasksRepository } from "./useTasksRepository";
import { showError, showSuccess, showWarning } from "../../../utils/toast";
import type { ProjectTasksRepository } from "../../../repositories/ProjectTasksRepository/ProjectTasksRepository";
import type { tareaInsumoProyecto } from "../../../models/Insumos";

const TASK_CREATION_CONCURRENCY = 10;

/**
 * Fachada principal del dominio de tareas de proyecto.
 * @param tasksSvc - Servicio de acceso a datos de tareas.
 * @returns Estado consolidado, acciones y utilidades del dominio de tareas.
 */
export function useTasks(tasksSvc: ProjectTasksRepository) {
  const graph = useGraphServices();
  const auth = useAuth();
  const repositories = useRepositories();

  const repo = useTasksRepository(tasksSvc);
  const listStatus = useAsyncStatus();
  const onGoingStatus = useAsyncStatus();

  const [onGoingTasks, setOnGoingTasks] = React.useState<projectTasks[]>([]);
  const [tasks, setTasks] = React.useState<projectTasks[]>([]);

  const form = useTaskForm();
  const { filters, setFilters, buildFilter } = useTaskFilters();
  const { holidays } = useHolidays();
  const dates = useTaskDates();
  const { calcularFechaTarea } = dates;
  const responsablesTarea = useResponsablesTarea();
  const assignments = useTaskAssignments(repo, responsablesTarea.repo);
  const progress = useTaskProgress(repo);
  const critical = useTaskCriticalPaths(repo, buildFilter);
  const projectController = useProjects();
  const notificationController = useNotifications();
  const flowRules = useReglasFlujo();

  const applySearchFilter = React.useCallback(
    (items: projectTasks[]) => {
      const term = filters.search.trim().toLowerCase();
      if (!term) return items;

      return items.filter((item) =>
        `${item.codigo ?? ""} ${item.nombre_tarea ?? ""}`.toLowerCase().includes(term)
      );
    },
    [filters.search]
  );

  /**
   * Carga las tareas abiertas de todos los proyectos en curso.
   * @param onGoingProjects - Proyectos actualmente en ejecucion.
   */
  const loadTasksOnGoing = React.useCallback(
    async (onGoingProjects: ProjectSP[]) => {
      onGoingStatus.start();
      try {
        const acc: projectTasks[] = [];
        for (const project of onGoingProjects) {
          const items = await repo.listByProject(project.id ?? "");
          acc.push(...items);
        }
        setOnGoingTasks(acc);
      } catch (e) {
        onGoingStatus.fail(e, "Error cargando tareas en curso");
        setOnGoingTasks([]);
      } finally {
        onGoingStatus.stop();
      }
    },
    [repo, onGoingStatus]
  );

  /**
   * Carga las tareas de un proyecto aplicando los filtros actuales.
   * @param projectId - Identificador del proyecto.
   * @returns Tareas resultantes.
   */
  const loadProjectTasks = React.useCallback(
    async (projectId: string): Promise<projectTasks[]> => {
      listStatus.start();
      try {
        const items = await repo.getAll({id_proyecto: Number(projectId)});
        const filtered = applySearchFilter(items);
        setTasks(filtered);
        return filtered;
      } catch (e) {
        listStatus.fail(e, "Error cargando tareas");
        setTasks([]);
        return [];
      } finally {
        listStatus.stop();
      }
    },
    [repo, buildFilter, applySearchFilter, listStatus]
  );

  /**
   * Carga todas las tareas de un proyecto sin aplicar filtros adicionales.
   * @param projectId - Identificador del proyecto.
   * @returns Todas las tareas del proyecto.
   */
  const loadAllProjectTasks = React.useCallback(
    async (projectId: string): Promise<projectTasks[]> => {
      listStatus.start();
      try {
        const items = await repo.getAll({ id_proyecto: Number(projectId) });
        const filtered = applySearchFilter(items);
        setTasks(filtered);
        return filtered;
      } catch (e) {
        listStatus.fail(e, "Error cargando tareas");
        setTasks([]);
        return [];
      } finally {
        listStatus.stop();
      }
    },
    [repo, applySearchFilter, listStatus]
  );

  /**
   * Actualiza la fase de una tarea y refresca la lista del proyecto.
   * @param taskId - Identificador de la tarea.
   * @param newPhase - Nueva fase de la tarea.
   * @param projectId - Proyecto al que pertenece la tarea.
   */
  const updateTaskPhase = React.useCallback(
    async (taskId: string, newPhase: string, projectId: string) => {
      listStatus.start();
      try {
        const current = tasks.find((item) => item.id === taskId);
        const template = current?.templateTask;

        if (!template?.id || !repositories.templateTask) {
          throw new Error("No se encontro la tarea plantilla asociada.");
        }

        await repositories.templateTask.updateTask(template.id, {
          ...template,
          fase: newPhase,
        });
        await loadProjectTasks(projectId);
      } catch (e) {
        listStatus.fail(e, "Error actualizando fase");
      } finally {
        listStatus.stop();
      }
    },
    [tasks, repositories.templateTask, loadProjectTasks, listStatus]
  );

  /**
   * Crea todas las tareas de un proyecto a partir de una plantilla base.
   * @param templateArr - Plantilla de tareas a crear.
   * @param projectId - Identificador del proyecto.
   * @param fechaInicioProyecto - Fecha de inicio del proyecto.
   * @param marca - Marca asociada al proyecto.
   * @param zona - Zona asociada al proyecto.
   * @returns Resultado de la creacion y codigos de tareas creadas.
   */
  const createAllFromTemplate = React.useCallback(
    async (
      templateArr: TemplateTasks[],
      projectId: string,
      fechaInicioProyecto: Date,
      marca: string,
      zona: string
    ) => {
      if (!templateArr?.length) {
        return {
          ok: false,
          data: [] as string[],
          taskMap: {} as Record<string, string>,
        };
      }

      listStatus.start();
      const creadas: string[] = [];
      const taskMap: Record<string, string> = {};

      try {
        const taskPayloads = templateArr.map((item) => {
          const fechaSolucion =
            item.codigo === "T1"
              ? item.dias_habiles
                ? calcularFechaTarea(item.dias_para_resolver, fechaInicioProyecto, holidays, item.dias_habiles)
                : null
              : null;

          const fechaInicio = item.codigo === "T1" ? new Date() : null;
          const estado = item.codigo === "T1" ? "Iniciada" : "Bloqueada";

          const payload: projectTasks = {
            id_tarea_plantilla: String(item.id ?? ""),
            id_proyecto: projectId,
            estado,
            fecha_cierre: null,
            fecha_resolucion: fechaSolucion?  toSupabaseDate(fechaSolucion) : null,
            razon_devolucion: "",
            razon_bloqueo: "",
            fecha_inicio: fechaInicio ? toSupabaseDate(fechaInicio) : null,
          };

          console.log(payload)

          return { item, payload };
        });

        const createdTasks: Array<{ item: TemplateTasks; createdTask: projectTasks }> = [];

        for (let i = 0; i < taskPayloads.length; i += TASK_CREATION_CONCURRENCY) {
          const batch = taskPayloads.slice(i, i + TASK_CREATION_CONCURRENCY);
          const createdBatch = await Promise.all(
            batch.map(async ({ item, payload }) => {
              const createdTask = await repo.create(payload);
              return { item, createdTask };
            })
          );

          for (const created of createdBatch) {
            createdTasks.push(created);
            if (created.createdTask.codigo) creadas.push(created.createdTask.codigo);
            if (created.item.id && created.createdTask.id) {
              taskMap[String(created.item.id)] = String(created.createdTask.id);
            }
          }
        }

        for (let i = 0; i < createdTasks.length; i += TASK_CREATION_CONCURRENCY) {
          const batch = createdTasks.slice(i, i + TASK_CREATION_CONCURRENCY);
          await Promise.all(
            batch.map(async ({ item, createdTask }) =>
              responsablesTarea.assignToTask({
                taskId: Number(createdTask.id ?? 0),
                templateTaskId: Number(item.id ?? 0),
                marca: Number(marca),
                zona: Number(zona),
              })
            )
          );
        }

        return { ok: true, data: creadas, taskMap };
      } catch (e) {
        listStatus.fail(e, "Error creando tareas");
        return {
          ok: false,
          data: [] as string[],
          taskMap: {} as Record<string, string>,
        };
      } finally {
        listStatus.stop();
      }
    },
    [repo, calcularFechaTarea, holidays, listStatus, responsablesTarea]
  );

  /**
   * Completa una tarea, actualiza progreso, desbloquea sucesores y emite notificaciones.
   * @param task - Tarea a completar.
   */
  const handleCompleteTask = React.useCallback(
    async (task: projectTasks) => {
      const data = await progress.setComplete(task);
      await createTaskLog(task.id!, auth.account?.name!, repositories.logTareas!, "Completar Tarea");

      if (data.ok) {
        const projectId = getProjectTaskProjectId(task);
        await projectController.updatePorcentaje(projectId, data.percent);

        const reglas = await flowRules.getRulesByTask(getProjectTaskTemplateId(task));

        if (reglas.length > 0) {
          const relaciones = await repositories.proyectoTareaInsumo?.loadRelation({id_tarea: Number(task.id), proyecto_id: Number(projectId)});

          if(!relaciones) return

          const insumoIds = relaciones.map((r: tareaInsumoProyecto) => r.id_insumo_proyecto).filter(Boolean);
          const insumosProyecto = insumoIds.length > 0 ? await repositories.projectInsumo?.listInsumos({ids: insumoIds}) : [];

          if(!insumosProyecto) {
            return
          }

          for (const regla of reglas) {
            const insumoRespuesta = insumosProyecto.find(
              (i: any) => String(i.id_insumo) === String(regla.id_plantilla_insumo)
            );

            const respuesta = String(insumoRespuesta?.texto ?? "").trim().toLowerCase();
            const esperado = String(regla.valor_esperado ?? "").trim().toLowerCase();
            const cumple = respuesta === esperado;

            const codigoDestinoActivar = cumple ? regla.tarea_si_cumple : regla.tarea_si_no_cumple;
            const codigoDestinoOmitir = cumple ? regla.tarea_si_no_cumple : regla.tarea_si_cumple;

            if (codigoDestinoActivar) {
              const destinoActivar = await repo.getPredecessorByCodigo(
                Number(codigoDestinoActivar),
                projectId
              );
              if (destinoActivar?.id) {
                await repo.update(destinoActivar.id, { estado: "Pendiente" });
              }
            }

            if (codigoDestinoOmitir) {
              const destinoOmitir = await repo.getPredecessorByCodigo(
                Number(codigoDestinoOmitir),
                projectId
              );
              if (destinoOmitir?.id) {
                await repo.update(destinoOmitir.id, { estado: "Omitida" });
              }
            }
          }
        }

        const successors = await repo.getSuccessorsByCodigo(task.id_tarea_plantilla, projectId);

        for (const successor of successors) {
          const newDate = dates.calcularFechaTarea(
            successor.dias_para_resolver ?? 0,
            new Date(data.completationDate!),
            holidays,
            successor.dias_habiles ?? false
          );
          await progress.setCompletationDateTask(successor.id!, newDate);
        }

        const freshTasks = await repo.getAll({id_proyecto: Number(projectId)});
        const freshUnlocked = freshTasks.filter((t) => successors.some((s) => s.id === t.id));

        await notificationController.sendUnlockedTaskNotification({
          predecessorTask: { Codigo: task.codigo, Title: task.nombre_tarea },
          unlockedTasks: freshUnlocked,
        });
      }

      await loadProjectTasks(getProjectTaskProjectId(task));
    },
    [
      progress,
      auth.account?.name,
      graph,
      projectController,
      flowRules,
      repo,
      dates,
      holidays,
      buildFilter,
      notificationController,
      loadProjectTasks,
    ]
  );

  /**
   * Devuelve una tarea a su predecesora y notifica a los responsables correspondientes.
   * @param task - Tarea actual.
   * @param motivoDevolucion - Motivo de la devolucion.
   */
  const returnTask = React.useCallback(
    async (task: projectTasks, motivoDevolucion: string) => {
      try {
        const projectId = getProjectTaskProjectId(task);
        const predesesor = await repo.getPredecessorByCodigo(task.dependencia ?? 0, projectId);
        if (predesesor && task.id) {
          const data = await progress.setReturned(predesesor);

          await notificationController.sendReturnedTaskNotication(
            task,
            predesesor,
            motivoDevolucion
          );
          await repo.update(task.id, { estado: "Bloqueado", razon_devolucion: motivoDevolucion });
          await createTaskLog(
            predesesor.id!,
            auth.account?.name!,
            repositories.logTareas!,
            "Tarea devuelta por el siguiente motivo: " + motivoDevolucion
          );
          await projectController.updatePorcentaje(projectId, data.percent);
          await loadProjectTasks(projectId);
          showSuccess("Se ha devuelto la tarea con exito");
        } else {
          showWarning("Esta tarea no tiene un predecesor definido.");
        }
      } catch (e) {
        showError("Algo ha salido mal");
        console.error("Error devolviendo tarea ", e);
      }
    },
    [repo, progress, notificationController, auth.account?.name, graph, projectController, loadProjectTasks]
  );

  /**
   * Bloquea o desbloquea manualmente una tarea por decision del usuario.
   * @param task - Tarea a actualizar.
   * @param razon - Justificacion del bloqueo.
   */
  const blockOrUnblockByUser = React.useCallback(
    async (task: projectTasks, razon: string) => {
      try {
        if (task.id) {
          const estado = task.Estado === "UserBlocked" ? "Iniciado" : "UserBlocked";
          const message =
            estado === "UserBlocked"
              ? "La tarea ha sido bloqueada correctamente. No recibiras notificaciones hasta que la desbloquees."
              : "La tarea ha sido desbloqueada correctamente. Ya puedes continuar y finalizarla.";

          const log =
            estado === "Iniciado"
              ? "tarea desbloqueada por el usuario"
              : "Tarea bloqueada por el usuario por el siguiente motivo: " + razon;

          await repo.update(task.id!, { estado, razon_bloqueo: razon });
          await createTaskLog(task.id!, auth.account?.name!, repositories.logTareas!, log);
          await loadProjectTasks(getProjectTaskProjectId(task));
          showSuccess(message);
        } else {
          showError("Algo ha salido mal, vuelva a intentarlo.");
        }
      } catch (e) {
        showError("Algo ha salido mal");
        console.error("Error bloqueando/desbloqueando tarea ", e);
      }
    },
    [repo, auth.account?.name, graph, loadProjectTasks]
  );

  return {
    tasks,
    onGoingTasks,
    filters,
    setFilters,
    loadProjectTasks,
    loadTasksOnGoing,
    updateTaskPhase,
    createAllFromTemplate,
    handleCompleteTask,
    returnTask,
    blockOrUnblockByUser,
    loadAllProjectTasks,
    ...form,
    ...repo,
    assignments,
    progress,
    critical,
    loading: listStatus.loading,
    error: listStatus.error,
    onGoingLoading: onGoingStatus.loading,
    onGoingError: onGoingStatus.error,
  };
}

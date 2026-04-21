import * as React from "react";
import type { TemplateTasks, projectTasks } from "../../../models/AperturaTienda";
import type { ProjectSP } from "../../../models/Projects";
import type { TareasProyectosService } from "../../../services/ProjectTasks.service";
import { toGraphDateTime } from "../../../utils/Date";
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

/**
 * Fachada principal del dominio de tareas de proyecto.
 * @param tasksSvc - Servicio de acceso a datos de tareas.
 * @returns Estado consolidado, acciones y utilidades del dominio de tareas.
 */
export function useTasks(tasksSvc: TareasProyectosService) {
  const graph = useGraphServices();
  const auth = useAuth();

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
  const projectController = useProjects(graph.proyectos);
  const notificationController = useNotifications();
  const flowRules = useReglasFlujo();

  /**
   * Carga las tareas abiertas de todos los proyectos en curso.
   * @param onGoingProjects - Proyectos actualmente en ejecución.
   */
  const loadTasksOnGoing = React.useCallback(
    async (onGoingProjects: ProjectSP[]) => {
      onGoingStatus.start();
      try {
        const acc: projectTasks[] = [];
        for (const project of onGoingProjects) {
          const items = await repo.listByProject(project.Id ?? "", { top: 10000 });
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
    async (projectId: string): Promise<TemplateTasks[]> => {
      listStatus.start();
      try {
        const items = await repo.getAll(buildFilter(projectId));
        setTasks(items);
        return items;
      } catch (e) {
        listStatus.fail(e, "Error cargando tareas");
        setTasks([]);
        return [];
      } finally {
        listStatus.stop();
      }
    },
    [repo, buildFilter, listStatus]
  );

  /**
   * Carga todas las tareas de un proyecto sin aplicar filtros adicionales.
   * @param projectId - Identificador del proyecto.
   * @returns Todas las tareas del proyecto.
   */
  const loadAllProjectTasks = React.useCallback(
    async (projectId: string): Promise<TemplateTasks[]> => {
      listStatus.start();
      try {
        const items = await repo.getAll({ filter: `fields/IdProyecto eq '${projectId}'` });
        setTasks(items);
        return items;
      } catch (e) {
        listStatus.fail(e, "Error cargando tareas");
        setTasks([]);
        return [];
      } finally {
        listStatus.stop();
      }
    },
    [repo, listStatus]
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
        await repo.update(taskId, { Phase: newPhase });
        await loadProjectTasks(projectId);
      } catch (e) {
        listStatus.fail(e, "Error actualizando fase");
      } finally {
        listStatus.stop();
      }
    },
    [repo, loadProjectTasks, listStatus]
  );

  /**
   * Crea todas las tareas de un proyecto a partir de una plantilla base.
   * @param templateArr - Plantilla de tareas a crear.
   * @param projectId - Identificador del proyecto.
   * @param fechaInicioProyecto - Fecha de inicio del proyecto.
   * @param marca - Marca asociada al proyecto.
   * @param zona - Zona asociada al proyecto.
   * @returns Resultado de la creación y códigos de tareas creadas.
   */
  const createAllFromTemplate = React.useCallback(
    async (
      templateArr: TemplateTasks[],
      projectId: string,
      fechaInicioProyecto: Date,
      marca: string,
      zona: string
    ) => {
      if (!templateArr?.length) return { ok: false, data: [] as string[] };

      listStatus.start();
      const creadas: string[] = [];

      try {
        for (const item of templateArr) {
          const fechaSolucion =
            item.Codigo === "T1"
              ? item.diasHabiles
                ? calcularFechaTarea(
                    item.Diaspararesolver,
                    fechaInicioProyecto,
                    holidays,
                    item.diasHabiles
                  )
                : null
              : null;

          const fechaInicio = item.Codigo === "T1" ? new Date() : null;
          const estado = item.Codigo === "T1" ? "Iniciada" : "Bloqueada";

          const payload: projectTasks = {
            Codigo: item.Codigo,
            Dependencia: item.Dependencia,
            Diaspararesolver: item.Diaspararesolver,
            IdProyecto: projectId,
            Phase: item.Phase,
            TipoTarea: item.TipoTarea,
            Title: item.Title,
            FechaResolucion: toGraphDateTime(fechaSolucion)!,
            Estado: estado,
            FechaCierre: null,
            diasHabiles: item.diasHabiles ?? false,
            fechaInicio: toGraphDateTime(fechaInicio)!,
            razonBloqueo: "",
            AreaResponsable: item.AreaResponsable,
          };

          const createdTask = await repo.create(payload);
          creadas.push(createdTask.Codigo);

          await responsablesTarea.assignToTask({
            taskId: createdTask.Id!,
            codigoTarea: item.Codigo,
            marca,
            zona,
          });
        }

        return { ok: true, data: creadas };
      } catch (e) {
        listStatus.fail(e, "Error creando tareas");
        return { ok: false, data: [] as string[] };
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
      await createTaskLog(task.Id!, auth.account?.name!, graph, "Completar Tarea");

      if (data.ok) {
        await projectController.updatePorcentaje(task.IdProyecto!, data.percent);

        const reglas = await flowRules.getRulesByTask(task.Codigo);

        if (reglas.length > 0) {
          const relaciones = await graph.tareaInsumoProyecto.getAllPlain({
            filter: `fields/Title eq '${task.Codigo}' and fields/ProyectoId eq '${task.IdProyecto}'`,
            top: 500,
          });

          const insumoIds = relaciones.map((r: any) => r.IdInsumoProyecto).filter(Boolean);
          const insumosProyecto = insumoIds.length > 0 ? await graph.insumoProyecto.getByIds(insumoIds) : [];

          for (const regla of reglas) {
            const insumoRespuesta = insumosProyecto.find(
              (i: any) => String(i.IdInsumo) === String(regla.IdPlantillaInsumo)
            );

            const respuesta = String(insumoRespuesta?.Texto ?? "").trim().toLowerCase();
            const esperado = String(regla.ValorEsperado ?? "").trim().toLowerCase();
            const cumple = respuesta === esperado;

            const codigoDestinoActivar = cumple ? regla.TareaSiCumple : regla.TareaSiNoCumple;
            const codigoDestinoOmitir = cumple ? regla.TareaSiNoCumple : regla.TareaSiCumple;

            if (codigoDestinoActivar) {
              const destinoActivar = await repo.getPredecessorByCodigo(
                codigoDestinoActivar,
                task.IdProyecto
              );
              if (destinoActivar?.Id) {
                await repo.update(destinoActivar.Id, { Estado: "Pendiente" });
              }
            }

            if (codigoDestinoOmitir) {
              const destinoOmitir = await repo.getPredecessorByCodigo(
                codigoDestinoOmitir,
                task.IdProyecto
              );
              if (destinoOmitir?.Id) {
                await repo.update(destinoOmitir.Id, { Estado: "Omitida" });
              }
            }
          }
        }

        const successors = await repo.getSuccessorsByCodigo(task.Codigo!, task.IdProyecto);

        for (const successor of successors) {
          const newDate = dates.calcularFechaTarea(
            successor.Diaspararesolver,
            new Date(data.completationDate!),
            holidays,
            successor.diasHabiles
          );
          await progress.setCompletationDateTask(successor.Id!, newDate);
        }

        const freshTasks = await repo.getAll(buildFilter(task.IdProyecto!));
        const freshUnlocked = freshTasks.filter((t) => successors.some((s) => s.Id === t.Id));

        await notificationController.sendUnlockedTaskNotification({
          predecessorTask: task,
          unlockedTasks: freshUnlocked,
        });
      }

      await loadProjectTasks(task.IdProyecto!);
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
   * @param motivoDevolucion - Motivo de la devolución.
   */
  const returnTask = React.useCallback(
    async (task: projectTasks, motivoDevolucion: string) => {
      try {
        const predesesor = await repo.getPredecessorByCodigo(task.Dependencia, task.IdProyecto);
        if (predesesor && task.Id) {
          const data = await progress.setReturned(predesesor);

          await notificationController.sendReturnedTaskNotication(
            task,
            predesesor,
            motivoDevolucion
          );
          await repo.update(task.Id, { Estado: "Bloqueado", razonDevolucion: motivoDevolucion });
          await createTaskLog(
            predesesor.Id!,
            auth.account?.name!,
            graph,
            "Tarea devuelta por el siguiente motivo: " + motivoDevolucion
          );
          await projectController.updatePorcentaje(task.IdProyecto, data.percent);
          await loadProjectTasks(task.IdProyecto);
          alert("Se ha devuelto la tarea con éxito");
        } else {
          alert("Esta tarea no tiene un predecesor definido.");
        }
      } catch (e) {
        alert("Algo ha salido mal");
        console.error("Error devolviendo tarea ", e);
      }
    },
    [repo, progress, notificationController, auth.account?.name, graph, projectController, loadProjectTasks]
  );

  /**
   * Bloquea o desbloquea manualmente una tarea por decisión del usuario.
   * @param task - Tarea a actualizar.
   * @param razon - Justificación del bloqueo.
   */
  const blockOrUnblockByUser = React.useCallback(
    async (task: projectTasks, razon: string) => {
      try {
        if (task.Id) {
          const Estado = task.Estado === "UserBlocked" ? "Iniciado" : "UserBlocked";
          const message =
            Estado === "UserBlocked"
              ? "La tarea ha sido bloqueada correctamente. No recibirás notificaciones hasta que la desbloquees."
              : "La tarea ha sido desbloqueada correctamente. Ya puedes continuar y finalizarla.";

          const log =
            Estado === "Iniciado"
              ? "tarea desbloqueada por el usuario"
              : "Tarea bloqueada por el usuario por el siguiente motivo: " + razon;

          await repo.update(task.Id, { Estado, razonBloqueo: razon });
          await createTaskLog(task.Id!, auth.account?.name!, graph, log);
          await loadProjectTasks(task.IdProyecto);
          alert(message);
        } else {
          alert("Algo ha salido mal, vuelva a intentarlo.");
        }
      } catch (e) {
        alert("Algo ha salido mal");
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

import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import type { projectTasks, taskResponsible } from "../../../models/AperturaTienda";
import { useInsumosProyecto } from "../../insumos";
import type { SendUnlockedTaskNotificationArgs } from "../types";
import { loadTaskInputs } from "../utils/loadTaskInputs";
import { buildReturnedTaskEmail, buildUnlockedTaskEmail } from "../utils/templates";
import { showWarning } from "../../../utils/toast";
import { useRepositories } from "../../../repositories/repositoriesContext";

/**
 * Hook orquestador para enviar notificaciones relacionadas con tareas.
 *
 * Reúne acceso a servicios Graph, carga de insumos asociados a una tarea
 * y construcción de correos para eventos funcionales del flujo de tareas.
 *
 * @returns Acciones para notificar desbloqueos y devoluciones de tareas.
 */
export function useNotifications() {
  const graph = useGraphServices();
  const repositories = useRepositories()
  const { loadInsumosFiles } = useInsumosProyecto(repositories.projectInsumo!);

  const linksRepo = repositories.proyectoTareaInsumo!;
  const insumoRepo = repositories.projectInsumo!
  const mailSvc = graph.mail;

  /**
   * Obtiene los insumos de entrada requeridos para una tarea concreta.
   * @param taskCodigo - Código funcional de la tarea.
   * @param proyectoId - Identificador del proyecto al que pertenece la tarea.
   * @returns Insumos listos para ser incluidos en una notificación.
   */
  const loadInputsForTask = React.useCallback((task_id: number, proyectoId: number) =>
      loadTaskInputs(
        {
          linksRepo,
          insumoRepo,
          plantillaRepo: repositories.plantillaInsumos!,
          loadInsumosFiles,
        },
        task_id,
        proyectoId
      ),
    [insumoRepo, linksRepo, loadInsumosFiles, repositories.plantillaInsumos]
  );

  /**
   * Envía notificaciones a los responsables de tareas recién desbloqueadas.
   * @param args - Tarea predecesora y tareas habilitadas tras completar el flujo anterior.
   * @returns Promesa resuelta cuando todas las notificaciones fueron procesadas.
   */
  const sendUnlockedTaskNotification = React.useCallback(async (args: SendUnlockedTaskNotificationArgs) => {
      const { predecessorTask, unlockedTasks } = args;
      if (!unlockedTasks?.length) return;

      for (const task of unlockedTasks) {
        const taskId = String(task.id ?? "").trim();
        if (!taskId) continue;

        const responsables: taskResponsible[] = (
          await repositories.projectTaskReponsible?.loadResponsible({
            tarea_id: Number(taskId)
          })
        ) ?? [];

        if (!responsables?.length) continue;

        const inputs = await loadInputsForTask(
          Number(task.id),
          Number(task.id_proyecto)
        );

        await Promise.all(
          responsables.map(async (responsable) => {
            const correo = (responsable.correo ?? "").trim();
            if (!correo) return;

            const email = buildUnlockedTaskEmail({
              correo,
              nombre: responsable.nombre ?? "Responsable",
              predecessorTask,
              task,
              inputs,
            });

            await mailSvc.sendEmail({
              message: {
                subject: email.subject,
                body: { contentType: "HTML", content: email.bodyHtml },
                toRecipients: email.toRecipients,
              },
              saveToSentItems: true,
            });
          })
        );
      }
    },
    [loadInputsForTask, mailSvc,]
  );

  /**
   * Envía una notificación de devolución a los responsables de la tarea predecesora.
   * @param actualTask - Tarea actual que rechaza o devuelve el flujo.
   * @param predessesorTask - Tarea anterior a la que se devuelve la gestión.
   * @param motivo - Justificación textual de la devolución.
   * @returns Promesa resuelta cuando todas las notificaciones fueron enviadas.
   */
  const sendReturnedTaskNotication = React.useCallback(
    async (actualTask: projectTasks, predessesorTask: projectTasks, motivo: string) => {
      const predecessorTaskId = String(predessesorTask.id ?? "").trim();

      const responsablesPredessesor: taskResponsible[] = (
        await repositories.projectTaskReponsible?.loadResponsible({
          tarea_id: Number(predecessorTaskId),
        })
      ) ?? []


      if (!responsablesPredessesor?.length) {
        showWarning("La tarea anterior no tiene responsables por lo que no se puede devolver");
        return;
      }

      const inputs = await loadInputsForTask(
        Number(predessesorTask.id),
        Number(predessesorTask.id_proyecto)
      );

      await Promise.all(
        responsablesPredessesor.map(async (responsable) => {
          const correo = (responsable.correo ?? "").trim();
          if (!correo) return;

          const email = buildReturnedTaskEmail({
            correo,
            motivo,
            actualTaskTitle: actualTask.nombre_tarea,
            predecessorTaskTitle: predessesorTask.nombre_tarea,
            inputs,
          });

          await mailSvc.sendEmail({
            message: {
              subject: email.subject,
              body: { contentType: "HTML", content: email.bodyHtml },
              toRecipients: email.toRecipients,
            },
            saveToSentItems: true,
          });
        })
      );
    },
    [loadInputsForTask, mailSvc,]
  );

  /**
   * API pública del hook de notificaciones.
   */
  return { sendUnlockedTaskNotification, sendReturnedTaskNotication };
}

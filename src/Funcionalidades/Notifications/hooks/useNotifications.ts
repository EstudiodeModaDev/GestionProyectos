import * as React from "react";
import { useGraphServices } from "../../../graph/graphContext";
import type { projectTasks, taskResponsible } from "../../../models/AperturaTienda";
import { useInsumosProyecto } from "../../Insumos";
import type { SendUnlockedTaskNotificationArgs } from "../types";
import { loadTaskInputs } from "../utils/loadTaskInputs";
import { buildReturnedTaskEmail, buildUnlockedTaskEmail } from "../utils/templates";

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
  const { loadInsumosFiles } = useInsumosProyecto(graph.insumoProyecto);

  const responsableRepo = graph.responsableProyecto;
  const linksRepo = graph.tareaInsumoProyecto;
  const insumoRepo = graph.insumoProyecto;
  const mailSvc = graph.mail;

  /**
   * Obtiene los insumos de entrada requeridos para una tarea concreta.
   * @param taskCodigo - Código funcional de la tarea.
   * @param proyectoId - Identificador del proyecto al que pertenece la tarea.
   * @returns Insumos listos para ser incluidos en una notificación.
   */
  const loadInputsForTask = React.useCallback((taskCodigo: string, proyectoId: string) =>
      loadTaskInputs({linksRepo, insumoRepo, loadInsumosFiles,}, taskCodigo, proyectoId),
    [insumoRepo, linksRepo, loadInsumosFiles]
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
        const taskId = String(task.Id ?? "").trim();
        if (!taskId) continue;

        const responsables: taskResponsible[] = (
          await responsableRepo.getAll({
            filter: `fields/IdTarea eq '${taskId}'`,
          })
        ).items;

        if (!responsables?.length) continue;

        const inputs = await loadInputsForTask(task.Codigo ?? "", task.IdProyecto);

        await Promise.all(
          responsables.map(async (responsable) => {
            const correo = (responsable.Correo ?? "").trim();
            if (!correo) return;

            const email = buildUnlockedTaskEmail({
              correo,
              nombre: responsable.Title ?? "Responsable",
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
    [loadInputsForTask, mailSvc, responsableRepo]
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
      const predecessorTaskId = String(predessesorTask.Id ?? "").trim();

      const responsablesPredessesor: taskResponsible[] = (
        await responsableRepo.getAll({
          filter: `fields/IdTarea eq '${predecessorTaskId}'`,
        })
      ).items;

      if (!responsablesPredessesor?.length) {
        alert("La tarea anterior no tiene responsables por lo que no se puede devolver");
        return;
      }

      const inputs = await loadInputsForTask(
        predessesorTask.Codigo ?? "",
        predessesorTask.IdProyecto
      );

      await Promise.all(
        responsablesPredessesor.map(async (responsable) => {
          const correo = (responsable.Correo ?? "").trim();
          if (!correo) return;

          const email = buildReturnedTaskEmail({
            correo,
            motivo,
            actualTaskTitle: actualTask.Title,
            predecessorTaskTitle: predessesorTask.Title,
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
    [loadInputsForTask, mailSvc, responsableRepo]
  );

  /**
   * API pública del hook de notificaciones.
   */
  return { sendUnlockedTaskNotification, sendReturnedTaskNotication };
}

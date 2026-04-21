import type { GraphRecipient } from "../../../graph/graphRest";
import type { projectTasks } from "../../../models/AperturaTienda";
import type { TaskInsumoView } from "../types";
import { safeDateLabel } from "./formatters";

/**
 * URL por defecto usada en correos cuando no se proporciona una ruta explícita al sistema.
 */
const DEFAULT_SITE_URL = "http://localhost:5173/";

/**
 * Construye el bloque HTML de insumos requerido en los correos.
 * @param inputs - Insumos disponibles para la tarea.
 * @param title - Título del bloque dentro del correo.
 * @returns Fragmento HTML con el detalle de insumos.
 */
function buildInputsHtml(inputs: TaskInsumoView[], title: string): string {
  if (inputs.length === 0) {
    return `<p><strong>Datos necesarios:</strong> No hay insumos configurados.</p>`;
  }

  return `
    <p><strong>${title}</strong></p>
    <ul>
      ${inputs
        .map(
          (input) =>
            `<li><strong>${input.title}:</strong> ${input.link ? input.link : input.texto}</li>`
        )
        .join("")}
    </ul>
  `;
}

/**
 * Construye el correo para notificar una tarea desbloqueada.
 * @param params - Datos del responsable, la tarea y sus insumos.
 * @returns Contenido listo para enviar por Microsoft Graph.
 */
export function buildUnlockedTaskEmail(params: {
  correo: string;
  nombre?: string;
  predecessorTask: { Title?: string; Codigo?: string };
  task: projectTasks;
  inputs: TaskInsumoView[];
}): {
  subject: string;
  bodyHtml: string;
  toRecipients: GraphRecipient[];
} {
  const { correo, nombre, predecessorTask, task, inputs } = params;
  const subject = `Tarea desbloqueada: ${task.Title} (${task.Codigo})`;
  const inputsHtml = buildInputsHtml(inputs, "Datos necesarios para realizar la tarea");

  /**
   * Cuerpo HTML del correo de desbloqueo.
   */
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
      <p>Hola <strong>${nombre ?? "Responsable"}</strong>,</p>

      <p>
        Se ha desbloqueado la tarea: <strong>${task.Title}</strong> (${task.Codigo})
        porque la tarea predecesora <strong>${predecessorTask.Title}</strong> (${predecessorTask.Codigo})
        fue completada.
      </p>

      <p><strong>Detalle de la tarea</strong></p>
      <ul>
        <li><strong>Inicio:</strong> ${safeDateLabel(task.fechaInicio ?? "")}</li>
        <li><strong>Vence:</strong> ${safeDateLabel(task.FechaResolucion ?? "")}</li>
        <li><strong>Fase:</strong> ${task.Phase ?? "-"}</li>
        <li><strong>Duracion:</strong> ${task.Diaspararesolver ?? 0} dias</li>
      </ul>

      ${inputsHtml}

      <p>Por favor inicia la gestion correspondiente.</p>

      <p style="margin-top:24px; font-size:12px; color:#666;">
        Notificacion automatica del sistema de apertura.
      </p>
    </div>
  `;

  return {
    subject,
    bodyHtml,
    toRecipients: [{ emailAddress: { address: correo } }],
  };
}

/**
 * Construye el correo para notificar la devolución de una tarea.
 * @param params - Datos del responsable, las tareas y los insumos relacionados.
 * @returns Contenido listo para enviar por Microsoft Graph.
 */
export function buildReturnedTaskEmail(params: {
  correo: string;
  motivo: string;
  actualTaskTitle?: string;
  predecessorTaskTitle?: string;
  inputs: TaskInsumoView[];
  siteUrl?: string;
}): {
  subject: string;
  bodyHtml: string;
  toRecipients: GraphRecipient[];
} {
  const {
    correo,
    motivo,
    actualTaskTitle,
    predecessorTaskTitle,
    inputs,
    siteUrl = DEFAULT_SITE_URL,
  } = params;

  const inputsHtml = buildInputsHtml(inputs, "Datos necesarios para llevar a cabo la tarea");
  const subject = `Devolucion: ${predecessorTaskTitle} por no contar con el visto bueno de ${actualTaskTitle}`;

  /**
   * Cuerpo HTML del correo de devolución.
   */
  const bodyHtml = `
    <div style="font-family: Arial, sans-serif; font-size: 14px;">
      <p>Hola. La tarea ${predecessorTaskTitle} fue devuelta por el siguiente motivo: ${motivo}.</p><br/>
      <p>Por favor corrige y vuelve a completar.</p>

      <p><strong>- Detalle de la tarea</strong></p>

      ${inputsHtml}

      <p><strong>- Acciones pendientes:</strong></p>
      <ol>
        <li>Realice la gestion propia de la tarea (ERP, correo, sitio web, App de requisiciones, entre otras)</li>
        <li>Abra el enlace <a href="${siteUrl}">Sitio gestion de proyectos</a>, en este podra bloquear o finalizar la tarea segun sea el caso</li>
      </ol>
    </div>
  `;

  return {
    subject,
    bodyHtml,
    toRecipients: [{ emailAddress: { address: correo } }],
  };
}

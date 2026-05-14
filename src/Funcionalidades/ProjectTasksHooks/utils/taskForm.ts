import type { projectTasks } from "../../../models/AperturaTienda";

/**
 * Estado inicial del formulario de tareas.
 */
export const initialTaskState: projectTasks = {
  id_tarea_plantilla: "",
  id_proyecto: "",
  estado: "",
  fecha_cierre: null,
  fecha_resolucion: null,
  razon_devolucion: "",
  razon_bloqueo: "",
  fecha_inicio: null,
};

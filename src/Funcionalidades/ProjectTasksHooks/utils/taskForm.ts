import type { projectTasks } from "../../../models/AperturaTienda";

/**
 * Estado inicial del formulario de tareas.
 */
export const initialTaskState: projectTasks = {
  Codigo: "",
  Dependencia: "",
  Diaspararesolver: 0,
  Phase: "",
  TipoTarea: "",
  Title: "",
  IdProyecto: "",
  FechaResolucion: "",
  Estado: "",
  FechaCierre: null,
  diasHabiles: false,
  fechaInicio: null,
  razonBloqueo: "",
  AreaResponsable: "",
};

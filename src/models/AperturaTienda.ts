export type TemplateTasks = {
  Id?: string;
  Title: string;
  Codigo: string;
  Phase: string;
  TipoTarea: string;
  Diaspararesolver: number;
  Dependencia: string;
  diasHabiles: boolean;
  AreaResponsable: string
}

export type projectTasks = TemplateTasks & {
  FechaResolucion: string | null
  IdProyecto: string;
  Estado: string;
  FechaCierre: string | null;  
  fechaInicio: string | null
  razonDevolucion?: string
  razonBloqueo: string
}

export type taskResponsible = {
  Id?: string;
  Title: string //Nombre
  Correo: string
  IdTarea: string
}

export type ResolvedAssignee = { nombre: string; correo: string };
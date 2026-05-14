export type TemplateTasks = {
  id?: string;
  nombre_tarea: string;
  area_responsable: string;
  codigo: string;
  fase: string;
  tipo_tarea: string;
  dias_para_resolver: number;
  dependencia: number | null;
  dias_habiles: boolean;
};

export type projectTasks = {
  id?: string;
  id_tarea_plantilla: string;
  id_proyecto: string;
  estado: string;
  fecha_cierre: string | null;
  fecha_resolucion: string | null;
  razon_devolucion: string;
  razon_bloqueo: string;
  fecha_inicio?: string | null;
  templateTask?: TemplateTasks | null;
  codigo?: string;
  nombre_tarea?: string;
  area_responsable?: string;
  fase?: string;
  tipo_tarea?: string;
  dias_para_resolver?: number;
  dependencia?: number | null;
  dias_habiles?: boolean;
  IdProyecto?: string;
  Estado?: string;
  FechaCierre?: string | null;
  FechaResolucion?: string | null;
  fechaInicio?: string | null;
  razonDevolucion?: string | null;
  razonBloqueo?: string | null;
};

export type taskResponsible = {
  id?: string;
  tarea_id: string; //Nombre
  nombre: string;
  correo: string;
};

export type ResolvedAssignee = { nombre: string; correo: string };

export type responsableReglaTarea = {
  id?: string;
  template_task_id: number | null //Codigo de la tarea
  id_marca: number | null;
  id_zona: number | null;
}

export type responsableReglaTareaDetalle = {
  id?: string;
  regla_id: string //Codigo de la tarea
  nombre: string;
  correo: string;
}

export type jefeZona = {
  id?: string;
  id_marca: string //Marca
  id_zona: string;
  jefe_nombre: string;
  jefe_correo: string;
}
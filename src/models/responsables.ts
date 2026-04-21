export type responsableReglaTarea = {
  Id?: string;
  Title: string //Codigo de la tarea
  Marca: string;
  Ciudad: string;
}

export type responsableReglaTareaDetalle = {
  Id?: string;
  Title: string //Codigo de la tarea
  Correo: string;
  Nombre: string;
  reglaId: number;
}

export type jefeZona = {
  Id?: string;
  Title: string //Marca
  Zona: string;
  JefeNombre: string;
  JefeCorreo: string;
}
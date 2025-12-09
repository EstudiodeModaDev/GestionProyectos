export type apertura = {
    Id?: string;
    Title: string;
    Responsable: string;
    CorreoResponsable: string;
    Dependencia: string;
    Codigo: string;
    Phase: string;
    Diaspararesolver: string;
    TipoTarea: string;
}

export type TaskApertura = apertura & {
  IdProyecto: string;
  FechaResolucion: string,
  Estado: string;
  FechaCierre: string | null;
};
export type ProjectSP = {
    Id?: string;
    Title: string;
    Descripcion: string; 
    Estado: string;
    Progreso: string;
    Lider: string;
    Fechadelanzamiento: string;
    FechaInicio: string
    fulfillment: number;
    CorreoLider: string,
    Marca: string;
    Zona: string;
}

export interface Kpm {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "danger" | "success" | "neutral";
}

export type ProjectError = Partial<Record<keyof ProjectSP, string>>;
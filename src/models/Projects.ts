export type ProjectSP = {
    id?: string;
    nombre_proyecto: string;
    estado: string;
    progreso: number;
    lider: string;
    fecha_inicio: string
    fulfillment: number;
    correo_lider: string,
    id_marca: string;
    id_zona: string;
}

export interface Kpm {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "danger" | "success" | "neutral";
}

export type ProjectError = Partial<Record<keyof ProjectSP, string>>;
export type TaskInsumoView = {
  id: string;
  title: string;
  tipo: string;
  texto: string;
  estado: "Subido" | "Pendiente";
  fileName?: string;
  fase?: string;
  options?: string[];
};

export type SalidaFiles = Record<string, File>;

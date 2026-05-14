export type TaskInsumoView = {
  id: string;
  title: string;
  tipo: string;
  texto: string;
  estado: "Subido" | "Pendiente";
  fase?: string;
};

export type SalidaFiles = Record<string, File>;

export const tasksPhases = [
  "Planificacion y concepto",
  "Diseno y construccion",
  "Adquisiciones y contratacion",
  "Pre-Apertura y Marketing",
  "Apertura y cierre",
];

export const generalActions = [
  {
    title: "Configurar zonas",
    description: "Agrupa territorios y define la base operativa para asignaciones.",
    variant: "primary" as const,
    key: "zonas",
  },
  {
    title: "Configurar marcas",
    description: "Mantiene el catalogo comercial que alimenta formularios y reglas.",
    variant: "ghost" as const,
    key: "marcas",
  },
  {
    title: "Configurar areas encargadas",
    description: "Organiza las areas duenas de tareas, seguimiento y aprobaciones.",
    variant: "ghost" as const,
    key: "areas",
  },
  {
    title: "Configurar jefes de zona",
    description: "Vincula cada marca y zona con el responsable que se resuelve en asignaciones automaticas.",
    variant: "ghost" as const,
    key: "jefes-zona",
  },
];

import type { ReglasFlujoTareas } from "../../../models/Insumos";

export function isReglaFlujoTarea(value: unknown): value is ReglasFlujoTareas {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Partial<ReglasFlujoTareas>;

  return (
    typeof obj.id === "number" &&
    typeof obj.nombre_regla === "string" &&
    typeof obj.id_template_task_origen === "string"
  );
}
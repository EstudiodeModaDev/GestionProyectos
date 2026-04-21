import type { Archivo } from "../../../models/Files";
import type { InsumoProyecto } from "../../../models/Insumos";
import type { TareaInsumoProyectoServicio } from "../../../services/TareaInsumoProyecto.service";
import type { TaskInsumoView } from "../types";



/**
 * Dependencias mínimas requeridas para resolver insumos asociados a una tarea.
 */
type NotificationDependencies = {
  linksRepo: TareaInsumoProyectoServicio;
  insumoRepo: {
    get: (id: string) => Promise<InsumoProyecto>;
    getByIds?: (ids: string[]) => Promise<InsumoProyecto[]>;
  };
  loadInsumosFiles: (insumoId: string) => Promise<Archivo | Archivo[]>;
};

/**
 * Carga y normaliza los insumos de entrada asociados a una tarea.
 * @param deps - Dependencias necesarias para obtener relaciones, insumos y adjuntos.
 * @param taskCodigo - Código de la tarea.
 * @param proyectoId - Identificador del proyecto.
 * @returns Insumos de entrada listos para usarse en notificaciones.
 */
export async function loadTaskInputs(deps: NotificationDependencies, taskCodigo: string, proyectoId: string): Promise<TaskInsumoView[]> {
  const { linksRepo, insumoRepo, loadInsumosFiles } = deps;
  if (!taskCodigo || !proyectoId) return [];

  const links = (
    await linksRepo.getAll({
      filter: `fields/Title eq '${taskCodigo}' and fields/ProyectoId eq '${proyectoId}'`,
      top: 4000,
    })
  ).items;

  if (!links?.length) return [];

  const insumoIds = links
    .map((link) => String(link.IdInsumoProyecto ?? "").trim())
    .filter((id) => id && /^\d+$/.test(id));

  if (!insumoIds.length) return [];

  let insumos: InsumoProyecto[] = [];
  try {
    // Cuando el servicio soporta búsqueda por lotes, reducimos llamadas al backend.
    insumos = insumoRepo.getByIds ? await insumoRepo.getByIds(insumoIds) : [];
  } catch {
    insumos = [];
  }

  if (!insumos.length) {
    // Fallback seguro cuando el servicio no implementa carga masiva o esta falla.
    const partial: InsumoProyecto[] = [];
    await Promise.allSettled(
      insumoIds.map(async (id) => {
        try {
          const item = await insumoRepo.get(id);
          if (item) partial.push(item);
        } catch {}
      })
    );
    insumos = partial;
  }

  /**
   * Índice de insumos por identificador para resolver rápidamente cada relación.
   */
  const insumoMap = new Map(
    (insumos ?? [])
      .filter((item) => item && (item as any).Id)
      .map((item: any) => [String(item.Id), item])
  );

  const results = await Promise.all(
    links.map(async (link) => {
      const insumo = insumoMap.get(String(link.IdInsumoProyecto ?? ""));
      if (!insumo) return null;

      const tipoUso = (link.TipoUso ?? "Entrada") as "Entrada" | "Salida";

      let url: string | undefined;
      try {
        // Si el insumo tiene adjuntos, usamos el primero como referencia principal en el correo.
        const filesResult = await loadInsumosFiles(insumo.Id ?? "");
        const files = Array.isArray(filesResult) ? filesResult : [filesResult];
        if (files.length > 0) url = files[0]?.webUrl;
      } catch {}

      const texto = String(insumo.Texto ?? "").trim();

      return {
        id: String(insumo.Id),
        title: String(insumo.NombreInsumo ?? insumo.Title ?? `Insumo ${insumo.IdInsumo ?? insumo.Id}`),
        tipo: tipoUso,
        texto,
        estado: url || texto ? "Subido" : "Pendiente",
        link: url,
      } as TaskInsumoView;
    })
  );

  // Para notificaciones solo se consideran insumos de entrada.
  return results
    .filter(Boolean)
    .filter((item) => (item as TaskInsumoView).tipo === "Entrada") as TaskInsumoView[];
}

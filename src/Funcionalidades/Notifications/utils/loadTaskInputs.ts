import type { Archivo } from "../../../models/Files";
import type { InsumoProyecto, plantillaInsumos } from "../../../models/Insumos";
import type { InsumosProyectosRepository } from "../../../repositories/insumosProyectoRepository/insumosProyectoRepository";
import type { PlantillaInsumosRepository } from "../../../repositories/plantillaInsumoRepository/PlantillaInsumosRepository";
import type { TareaInsumoProyectoRepository } from "../../../repositories/TareaInsumoProyectoRepository/TareaInsumoProyectoRepository";
import type { TaskInsumoView } from "../types";

const DEFAULT_INSUMOS_PROCESS = "Apertura tienda";

/**
 * Dependencias mÃ­nimas requeridas para resolver insumos asociados a una tarea.
 */
type NotificationDependencies = {
  linksRepo: TareaInsumoProyectoRepository;
  insumoRepo: InsumosProyectosRepository;
  plantillaRepo: PlantillaInsumosRepository;
  loadInsumosFiles: (insumoId: string) => Promise<Archivo | Archivo[]>;
};

/**
 * Carga y normaliza los insumos de entrada asociados a una tarea.
 * @param deps - Dependencias necesarias para obtener relaciones, insumos y adjuntos.
 * @param taskCodigo - CÃ³digo de la tarea.
 * @param proyectoId - Identificador del proyecto.
 * @returns Insumos de entrada listos para usarse en notificaciones.
 */
export async function loadTaskInputs(
  deps: NotificationDependencies,
  task_id: number,
  proyectoId: number
): Promise<TaskInsumoView[]> {
  const { linksRepo, insumoRepo, plantillaRepo, loadInsumosFiles } = deps;
  if (!task_id || !proyectoId) return [];

  const links = (
    await linksRepo.loadRelation({id_tarea: task_id, proyecto_id: proyectoId})
  );

  if (!links?.length) return [];

  const insumoIds = links
    .map((link) => String(link.id_insumo_proyecto ?? "").trim())
    .filter((id) => id && /^\d+$/.test(id));

  if (!insumoIds.length) return [];

  let insumos: InsumoProyecto[] = [];
  try {
    insumos = await insumoRepo.listInsumos({ ids: insumoIds });
  } catch {
    insumos = [];
  }

  if (!insumos.length) {
    const partial: InsumoProyecto[] = [];
    await Promise.allSettled(
      insumoIds.map(async (id) => {
        try {
          const item = (await insumoRepo.listInsumos({ id }))[0];
          if (item) partial.push(item);
        } catch {}
      })
    );
    insumos = partial;
  }

  let plantillaItems: plantillaInsumos[] = [];
  try {
    plantillaItems = await plantillaRepo.listByProceso(DEFAULT_INSUMOS_PROCESS);
  } catch {
    plantillaItems = [];
  }

  const insumoMap = new Map(
    (insumos ?? [])
      .filter((item) => item && item.id)
      .map((item) => [String(item.id), item])
  );

  const plantillaMap = new Map(
    plantillaItems
      .filter((item) => item && item.id)
      .map((item) => [String(item.id), item])
  );

  const results = await Promise.all(
    links.map(async (link) => {
      const insumo = insumoMap.get(String(link.id_insumo_proyecto ?? ""));
      if (!insumo) return null;

      const plantilla = plantillaMap.get(String(insumo.id_insumo ?? ""));
      const tipoUso = (link.tipo_uso ?? "Entrada") as "Entrada" | "Salida";

      let url: string | undefined;
      try {
        const filesResult = await loadInsumosFiles(insumo.id ?? "");
        const files = Array.isArray(filesResult) ? filesResult : [filesResult];
        if (files.length > 0) url = files[0]?.webUrl;
      } catch {}

      const texto = String(insumo.texto ?? "").trim();

      return {
        id: String(insumo.id),
        title: String(plantilla?.nombre_insumo ?? `Insumo ${insumo.id_insumo ?? insumo.id}`),
        tipo: tipoUso,
        texto,
        estado: url || texto || insumo.file_path ? "Subido" : "Pendiente",
        link: url,
      } as TaskInsumoView;
    })
  );

  return results
    .filter(Boolean)
    .filter((item) => (item as TaskInsumoView).tipo === "Entrada") as TaskInsumoView[];
}

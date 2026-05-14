import type { marcas, zonas } from "../../models/generalConfigs";
import type { InsumosProyectosRepository } from "../../repositories/insumosProyectoRepository/insumosProyectoRepository";

export const PROJECT_AUTO_FILL_INSUMO_IDS = {
  fechaLanzamiento: "6",
  formatoTienda: "10",
  zona: "11",
} as const;

type AutoFillContext = {
  fechaLanzamiento: string;
  marcaId: string;
  zonaId: string;
  marcas: marcas[];
  zonas: zonas[];
};

type AutoFillRule = {
  templateInsumoId: string;
  resolveText: (context: AutoFillContext) => string;
};

const AUTO_FILL_RULES: AutoFillRule[] = [
  {
    templateInsumoId: PROJECT_AUTO_FILL_INSUMO_IDS.fechaLanzamiento,
    resolveText: (context) => context.fechaLanzamiento,
  },
  {
    templateInsumoId: PROJECT_AUTO_FILL_INSUMO_IDS.formatoTienda,
    resolveText: (context) => {
      const marca = context.marcas.find((item) => String(item.id ?? "") === context.marcaId);
      return String(marca?.nombre_marca ?? context.marcaId).trim();
    },
  },
  {
    templateInsumoId: PROJECT_AUTO_FILL_INSUMO_IDS.zona,
    resolveText: (context) => {
      const zona = context.zonas.find((item) => String(item.id ?? "") === context.zonaId);
      return String(zona?.zonas ?? context.zonaId).trim();
    },
  },
];

type ApplyAutoFillArgs = {
  insumoMap: Record<string, string>;
  insumoRepository: InsumosProyectosRepository;
  context: AutoFillContext;
};

export async function applyProjectAutoFillInsumos({
  insumoMap,
  insumoRepository,
  context,
}: ApplyAutoFillArgs) {
  const updates = AUTO_FILL_RULES.map(async (rule) => {
    const projectInsumoId = String(insumoMap[rule.templateInsumoId] ?? "").trim();
    if (!projectInsumoId) return;

    const text = rule.resolveText(context).trim();
    if (!text) return;

    await insumoRepository.updateInsumoProyecto(projectInsumoId, { texto: text });
  });

  await Promise.all(updates);
}

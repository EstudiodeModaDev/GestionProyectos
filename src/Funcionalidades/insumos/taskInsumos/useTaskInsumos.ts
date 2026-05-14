import React from "react";
import type { projectTasks } from "../../../models/AperturaTienda";
import type { InsumoProyecto, plantillaInsumos, tareaInsumoProyecto } from "../../../models/Insumos";
import { useRepositories } from "../../../repositories/repositoriesContext";
import { DEFAULT_INSUMOS_PROCESS } from "../shared/constants";
import type { TaskInsumoView } from "../shared/types";
import { getProjectInsumoId, getTemplateInsumoId } from "../shared/utils";
import { buildTaskInsumoView } from "./utils";

export function useTaskInsumos(task: projectTasks | null) {
  const repositories = useRepositories();
  const [inputs, setInputs] = React.useState<TaskInsumoView[]>([]);
  const [outputs, setOutputs] = React.useState<TaskInsumoView[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!task) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const links =
          (await repositories.proyectoTareaInsumo?.loadRelation({
            id_tarea: Number(task.id),
            proyecto_id: Number(task.id_proyecto),
          })) ?? [];

        if (!links.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        const insumoIds = links.map((link) => link.id_insumo_proyecto).filter(Boolean);
        if (!insumoIds.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        const [insumos, plantillaItems] = await Promise.all([
          repositories.projectInsumo?.listInsumos({ ids: insumoIds }) ?? [],
          repositories.plantillaInsumos?.listByProceso(DEFAULT_INSUMOS_PROCESS) ?? [],
        ]);

        console.log(insumos)

        const insumoMap = new Map<string, InsumoProyecto>(
          insumos
            .filter((item): item is InsumoProyecto => !!getProjectInsumoId(item))
            .map((item) => [getProjectInsumoId(item), item])
        );

        const plantillaMap = new Map<string, plantillaInsumos>(
          plantillaItems
            .filter((item): item is plantillaInsumos => !!String(item.id ?? "").trim())
            .map((item) => [String(item.id), item])
        );

        const entradas: TaskInsumoView[] = [];
        const salidas: TaskInsumoView[] = [];

        for (const link of links as tareaInsumoProyecto[]) {
          const insumo = insumoMap.get(String(link.id_insumo_proyecto));

          if (!insumo) continue;

          

          const plantilla = plantillaMap.get(getTemplateInsumoId(insumo));
          const view = buildTaskInsumoView(link, insumo, plantilla);

          if (view.fase === "Entrada") entradas.push(view);
          else salidas.push(view);
        }

        if (!cancelled) {
          setInputs(entradas);
          setOutputs(salidas);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? "Error cargando insumos");
          setInputs([]);
          setOutputs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [repositories.plantillaInsumos, repositories.projectInsumo, repositories.proyectoTareaInsumo, task]);

  const pendientesSalida = outputs.filter((item) => item.estado === "Pendiente");

  return { inputs, outputs, loading, error, pendientesSalida };
}

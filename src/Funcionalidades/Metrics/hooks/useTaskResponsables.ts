import React from "react";
import type { taskResponsible } from "../../../models/AperturaTienda";
import { useGraphServices } from "../../../graph/graphContext";
import { chunk } from "../utils/arrayUtils";

/**
 * Carga responsables agrupados por identificador de tarea.
 * @param taskIds - Tareas para las que se deben resolver responsables.
 * @returns Diccionario de responsables y estado de carga asociado.
 */
export function useTaskResponsables(taskIds: string[]) {
  const graph = useGraphServices();
  const [responsablesByTaskId, setResponsablesByTaskId] = React.useState<Record<string, taskResponsible[]>>({});
  const [responsablesLoading, setResponsablesLoading] = React.useState(false);
  const [responsablesError, setResponsablesError] = React.useState<string | null>(null);

  const taskIdsKey = React.useMemo(() => [...taskIds].sort().join("|"), [taskIds]);

  React.useEffect(() => {
    if (!taskIds.length) {
      setResponsablesByTaskId({});
      return;
    }

    let cancelled = false;

    (async () => {
      setResponsablesLoading(true);
      setResponsablesError(null);

      try {
        const grouped: Record<string, taskResponsible[]> = {};

        for (const ids of chunk(taskIds, 20)) {
          const filter = ids.map((id) => `fields/IdTarea eq '${id}'`).join(" or ");
          const rows = await graph.responsableProyecto.getAll({ filter, top: 10000 });

          for (const row of rows) {
            const taskId = String(row.IdTarea ?? "").trim();
            if (!taskId) continue;
            (grouped[taskId] ||= []).push(row);
          }
        }

        if (!cancelled) setResponsablesByTaskId(grouped);
      } catch (e: any) {
        if (!cancelled) {
          setResponsablesByTaskId({});
          setResponsablesError(e?.message ?? "No fue posible cargar los responsables.");
        }
      } finally {
        if (!cancelled) setResponsablesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [graph.responsableProyecto, taskIdsKey]);

  return {
    responsablesByTaskId,
    responsablesLoading,
    responsablesError,
  };
}

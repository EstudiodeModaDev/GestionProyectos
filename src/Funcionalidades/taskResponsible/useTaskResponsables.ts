import React from "react";
import type { taskResponsible } from "../../models/AperturaTienda";
import { useRepositories } from "../../repositories/repositoriesContext";

const TASK_IDS_CHUNK_SIZE = 100;

/**
 * Carga responsables agrupados por identificador de tarea.
 * @param taskIds - Tareas para las que se deben resolver responsables.
 * @returns Diccionario de responsables y estado de carga asociado.
 */
export function useTaskResponsables(taskIds: string[]) {
  const repositories = useRepositories();
  const [responsablesByTaskId, setResponsablesByTaskId] = React.useState<Record<string, taskResponsible[]>>({});
  const [responsablesLoading, setResponsablesLoading] = React.useState(false);
  const [responsablesError, setResponsablesError] = React.useState<string | null>(null);

  const taskIdsKey = React.useMemo(() => [...taskIds].sort().join("|"), [taskIds]);

  React.useEffect(() => {
    if (!taskIds.length) {
      setResponsablesByTaskId({});
      setResponsablesLoading(false);
      setResponsablesError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setResponsablesLoading(true);
      setResponsablesError(null);

      try {
        const grouped: Record<string, taskResponsible[]> = {};

        for (let i = 0; i < taskIds.length; i += TASK_IDS_CHUNK_SIZE) {
          const ids = taskIds.slice(i, i + TASK_IDS_CHUNK_SIZE);
          const rows = await repositories.projectTaskReponsible?.loadResponsible({ tarea_ids: ids });

          if (!rows?.length) continue;

          for (const row of rows) {
            const taskId = String(row.tarea_id ?? "").trim();
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
  }, [repositories.projectTaskReponsible, taskIds, taskIdsKey]);

  return {
    responsablesByTaskId,
    responsablesLoading,
    responsablesError,
  };
}

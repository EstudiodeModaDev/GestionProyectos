import * as React from "react";
import { useAsyncStatus } from "../commons/useAsyncStatus";
import { useResponsableTareaRepository } from "./useResponsableTareaRepository";
import { useResponsableRulesRepository } from "./useResponsableRulesRepository";
import { useResponsableResolver } from "./useResponsableResolver";

/**
 * Orquesta la carga y asignación de responsables de una tarea.
 * @returns Estado, repositorio y operaciones principales del dominio.
 */
export function useResponsablesTarea() {
  const repo = useResponsableTareaRepository();
  const rulesRepo = useResponsableRulesRepository();
  const resolver = useResponsableResolver(rulesRepo);

  const status = useAsyncStatus();
  const listStatus = useAsyncStatus();

  const [items, setItems] = React.useState<Awaited<ReturnType<typeof repo.getByTaskId>>>([]);

  /**
   * Carga los responsables actuales de una tarea.
   * @param taskId - Identificador de la tarea.
   * @returns Responsables encontrados.
   */
  const loadByTaskId = React.useCallback(async (taskId: number) => {
    status.start();
    try {
      const data = (await repo.getByTaskId(Number(taskId)));
      console.log(data);
      setItems(data ?? []);
      return data ?? [];
    } finally {
      status.stop();
    }
  }, [repo, status]);

  /**
   * Resuelve y asigna responsables a una tarea recién creada.
   * @param args - Contexto necesario para resolver responsables por reglas.
   * @returns Resultado de la asignación.
   */
  const assignToTask = React.useCallback(async (args: { taskId: number; templateTaskId: number; marca: number; zona: number;}) => {
    listStatus.start();
    try {
      const resolveArgs = {
        tarea: args.templateTaskId,
        marca: args.marca,
        zona: args.zona
      }
      console.log(resolveArgs)
      const resolved = await resolver.resolve(resolveArgs);
      const payload = resolved.map((item) => ({
        nombre: item.nombre,
        correo: item.correo,
      }));

      await repo.createMany(String(args.taskId), payload);

      const next = await repo.getByTaskId(Number(args.taskId));
      setItems(next ?? []);

      return { ok: true, count: resolved.length };
    } catch (e: any) {
      listStatus.fail(e, "Error asignando responsables a la tarea");
      return { ok: false, count: 0 };
    } finally {
      listStatus.stop();
    }
  }, [repo, resolver, listStatus]);

  return {
    items,
    status,
    repo,
    loadByTaskId,
    assignToTask,
    ...repo,
    loading: listStatus.loading,
    error: listStatus.error,
  };
}

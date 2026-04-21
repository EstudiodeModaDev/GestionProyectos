import * as React from "react";
import { useAuth } from "../../../auth/authProvider";
import type { ProjectSP } from "../../../models/Projects";
import { buildProjectCreatePayload, createInitialProjectState } from "../utils/projectForm";

/**
 * Administra el estado y los helpers del formulario de proyectos.
 * @returns Estado del formulario y acciones para modificarlo o construir su payload.
 */
export function useProjectForm() {
  const { account } = useAuth();
  const [state, setState] = React.useState<ProjectSP>(() => createInitialProjectState(account));

  React.useEffect(() => {
    setState((current) => ({
      ...current,
      CorreoLider: account?.username ?? "",
      Lider: account?.name ?? "",
    }));
  }, [account?.username, account?.name]);

  /**
   * Actualiza un campo específico del formulario.
   * @param key - Propiedad del proyecto a modificar.
   * @param value - Nuevo valor para la propiedad.
   */
  const setField = <K extends keyof ProjectSP>(key: K, value: ProjectSP[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  /**
   * Restaura el formulario a su estado inicial.
   */
  const reset = React.useCallback(() => {
    setState(createInitialProjectState(account));
  }, [account]);

  /**
   * Genera el payload de creación a partir del estado actual del formulario.
   * @returns Proyecto normalizado para persistencia.
   */
  const buildCreatePayload = React.useCallback((): ProjectSP => {
    return buildProjectCreatePayload(state);
  }, [state]);

  return { state, setState, setField, reset, buildCreatePayload };
}

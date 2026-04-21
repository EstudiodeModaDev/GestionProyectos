import * as React from "react";
import { useExplorerActions } from "./useTicketAttachmentAction";
import { useInsumosAttachmentData } from "./useInsumosAttachmentData";

/**
 * Orquesta la carga y manipulación de adjuntos asociados a insumos.
 * @returns Estado de carga, errores y acciones de lectura/subida.
 */
export function useInsumosAttachment() {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const { load } = useInsumosAttachmentData({ setLoading, setError });
  const actions = useExplorerActions();

  return {
    loading,
    error,
    reload: load,
    ...actions,
  };
}

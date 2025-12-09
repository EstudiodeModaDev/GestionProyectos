import React from "react";
import type { AperturaTiendaService } from "../services/Plantillas.service";
import type { apertura } from "../models/AperturaTienda";

export function useAperturaTienda(aperturaSvc: AperturaTiendaService) {
  const [rows, setRows] = React.useState<apertura[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState<string>("");
  const [state, setState] = React.useState<apertura>({
    Codigo: "",
    CorreoResponsable: "",
    Dependencia: "",
    Diaspararesolver: "",
    Phase: "",
    Responsable: "",
    TipoTarea: "",
    Title: ""
  });
  const setField = <K extends keyof apertura>(k: K, v: apertura[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadTasks = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await aperturaSvc.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [aperturaSvc]);

  React.useEffect(() => {
    loadTasks();
  }, [loadTasks, search]);

  // recargas por cambios externos
  const applyRange = React.useCallback(() => { loadTasks(); }, [loadTasks]);
  const reloadAll  = React.useCallback(() => { loadTasks(); }, [loadTasks, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
          
      // Objeto de creación
      const payload: apertura = {
        Codigo: state.Codigo ?? "",
        CorreoResponsable: "Iniciado",
        Dependencia: "",
        Diaspararesolver: "",
        Phase: "",
        Responsable: "",
        TipoTarea: "",
        Title: ""
      };
      await aperturaSvc.create(payload);
      alert("Se ha creado el registro con éxito")
    } finally {
        setLoading(false);
      }
  };

  return {
    rows, loading, error, search, state,
    applyRange, reloadAll, setSearch, setField, handleSubmit, loadTasks
  };
}
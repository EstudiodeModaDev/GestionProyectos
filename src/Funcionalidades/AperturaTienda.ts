import React from "react";
import type { AperturaTiendaService } from "../services/Plantillas.service";
import type { apertura } from "../models/AperturaTienda";

export function useAperturaTiendaPlantilla(aperturaSvc: AperturaTiendaService) {
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
          
      // Objeto de creación
      const payload: apertura = {
        Codigo: state.Codigo ?? "",
        CorreoResponsable: "",
        Dependencia: state.Dependencia,
        Diaspararesolver: state.Diaspararesolver,
        Phase: state.Phase,
        Responsable: "",
        TipoTarea: state.TipoTarea,
        Title: state.Title
      };
      await aperturaSvc.create(payload);
      alert("Se ha creado el registro con éxito")
      await loadTasks()
    } finally {
        setLoading(false);
      }
  };

  const handleEdit = async (Id: string,) => {
    setLoading(true);
    try {
          
      // Objeto de creación
      const payload: apertura = {
        Codigo: state.Codigo ?? "",
        CorreoResponsable: "Iniciado",
        Dependencia: state.Dependencia,
        Diaspararesolver: state.Diaspararesolver,
        Phase: state.Phase,
        Responsable: state.Responsable,
        TipoTarea: state.TipoTarea,
        Title: state.Title
      };
      await aperturaSvc.update(Id, payload);
      alert("Se ha editado el registro con éxito")
      await loadTasks()
    } finally {
        setLoading(false);
      }
  };

  const handleDelete = async (Id: string,) => {
    setLoading(true);
    try {
      const ok = window.confirm("¿Seguro que quieres eliminar esta tarea?\nEsta acción no se puede deshacer.");
      if (!ok) return;
      await aperturaSvc.delete(Id);
      await loadTasks()
      alert("Se ha eliminado el registro con éxito")
    } finally {
        setLoading(false);
      }
  };


  return {
    rows, loading, error, search, state,
    applyRange, reloadAll, setSearch, setField, handleSubmit, loadTasks, handleEdit, handleDelete
  };
}
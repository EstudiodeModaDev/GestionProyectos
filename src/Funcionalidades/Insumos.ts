import { InsumoProyectoService } from './../services/InsumoProyecto.service';
import React from "react";
import type {InsumoProyecto, plantillaInsumos, plantillaTareaInsumo, tareaInsumoProyecto } from "../models/Insumos";
import type { TaskApertura } from "../models/AperturaTienda";
import type { PlantillaInsumoService } from "../services/PlantillaInsumos.service";
import type { PlantillaTareaInsumoService } from "../services/PlantillaTareaInsumo.service";
import type { TareaInsumoProyectoServicio } from "../services/TareaInsumoProyecto.service";
import { useGraphServices } from "../graph/graphContext";

export type TaskInsumoView = {
  id: string;
  title: string;
  tipo: "Entrada" | "Salida";
  texto: string;                      // <- nuevo
  estado: "Subido" | "Pendiente";     // <- más claro
};

export function usePlantillaInsumos(insumosPlantillaSvc: PlantillaInsumoService) {
  const [insumos, setInsumos] = React.useState<plantillaInsumos[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<plantillaInsumos>({
    Categoria: "",
    Proceso: "",
    Title: "",
  });
  const setField = <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadInsumosPlantilla = React.useCallback(async (proceso: string) => {
    setLoading(true); setError(null);
    try {
      console.log(proceso)
      const items = await insumosPlantillaSvc.getAll({filter: `fields/Proceso eq '${proceso}'`})
      setInsumos(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setInsumos([]);
    } finally {
      setLoading(false);
    }
  }, [insumosPlantillaSvc]);

  return {
    loading, error, state, insumos,
    setField, loadInsumosPlantilla
  }
};

export function useTareaPlantillaInsumo(plantillaTareaInsumo: PlantillaTareaInsumoService) {
  const [insumos, setInsumos] = React.useState<plantillaTareaInsumo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<plantillaTareaInsumo>({
    IdInsumo: "",
    Proceso: "",
    TipoInsumo: "",
    Title: "",
  });
  const setField = <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadTareaInsumosPlantilla = React.useCallback(async (proceso: string) => {
    setLoading(true); setError(null);
    try {
      const items = await plantillaTareaInsumo.getAll({filter: `fields/Proceso eq '${proceso}'`})
      setInsumos(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setInsumos([]);
    } finally {
      setLoading(false);
    }
  }, [plantillaTareaInsumo]);

  return {
    loading, error, state, insumos,
    setField, loadTareaInsumosPlantilla
  }
};

export function useInsumosProyecto(insumosProyectoSvc: InsumoProyectoService) {
  const [rows, setRows] = React.useState<InsumoProyecto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<InsumoProyecto>({
    CategoriaInsumo: "",
    IdInsumo: "",
    Texto: "",
    TipoInsumo: "",
    Title: "",
    NombreInsumo: "",
  });
  const setField = <K extends keyof InsumoProyecto>(k: K, v: InsumoProyecto[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadFirstPage = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await insumosProyectoSvc.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [insumosProyectoSvc]);

  React.useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // recargas por cambios externos
  const applyRange = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage]);
  const reloadAll  = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage]);

  const saveInsumo = async (e: React.FormEvent, Id: string, Insumo: string) => {
    e.preventDefault();
    setLoading(true);
    try {
          
      const created = await insumosProyectoSvc.update(Id, {Texto: Insumo});
      alert("Se ha actualizado el registro con éxito")
      return created
    } finally {
        setLoading(false);
      }
  };

  const createAllInsumosFromTemplate = async (e: React.FormEvent, templateInsumos: plantillaInsumos[], IdProyecto: string,) => {
    e.preventDefault()

    if (!templateInsumos || templateInsumos.length === 0) {
      alert("No hay insumos definidos para esta plantilla");
      return {
        ok: false,
        data: []
      };
    }

    setLoading(true)
    const mapByCodigo: Record<string, string> = {};

    try{
      for (const item of templateInsumos) {

        const payload: InsumoProyecto = {
          CategoriaInsumo: item.Categoria,
          IdInsumo: item.Id ?? "",
          Texto: "",
          TipoInsumo: item.Categoria,
          Title: IdProyecto,
          NombreInsumo: item.Title,
        };

        

        const insumoCreated = await insumosProyectoSvc.create(payload); // aquí sí se espera bien
        mapByCodigo[item.Id!] = insumoCreated.Id!; 
      }
    } catch (e) {
      console.error("Se ha producido un error creando los insumos proyecto ", e)
    } finally {
      setLoading(false)
    }
    return {
      ok: true,
      data: mapByCodigo
    };
  };

  return {
    rows, loading, error, state,
    applyRange, reloadAll, setField, loadFirstPage, saveInsumo, createAllInsumosFromTemplate
  };
}

export function useTareaInsumoProyecto(tareaInsumoProyecto: TareaInsumoProyectoServicio) {
  const [rows, setRows] = React.useState<tareaInsumoProyecto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<tareaInsumoProyecto>({
    IdInsumoProyecto: "",
    TipoUso: "",
    Title: "",
  });
  const setField = <K extends keyof TareaInsumoProyectoServicio>(k: K, v: TareaInsumoProyectoServicio[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadFirstPage = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await tareaInsumoProyecto.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tareaInsumoProyecto]);

  React.useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // recargas por cambios externos
  const applyRange = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage]);
  const reloadAll  = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage]);

  const createAllInsumosTareaFromTemplate = async (e: React.FormEvent, templateInsumos: plantillaTareaInsumo[], data: any) => {
    e.preventDefault();

    if (!templateInsumos || templateInsumos.length === 0) {
      alert("No hay insumos plantillaTareaInsumo definidos");
      return {
        ok: false,
        data: []
      };
    }

    setLoading(true)

    try{
      for (const item of templateInsumos) {

        const payload: tareaInsumoProyecto = {
            IdInsumoProyecto: data[item.IdInsumo!],
            TipoUso: item.TipoInsumo,
            Title: item.Title
        };

        await tareaInsumoProyecto.create(payload); // aquí sí se espera bien
      }
    } catch (e) {
      console.error("Se ha producido un error creando los insumos proyecto ", e)
    } finally {
      setLoading(false)
    }
    return {
      ok: true,
    };
  };

  return {
    rows, loading, error, state,
    applyRange, reloadAll, setField, loadFirstPage, createAllInsumosTareaFromTemplate, 
  };
}

export function useTaskInsumos(task: TaskApertura | null) {
  const {insumoProyecto, tareaInsumoProyecto } = useGraphServices();
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
        // 1. Vínculos tarea-insumo
        const links: tareaInsumoProyecto[] = await tareaInsumoProyecto.getAll({
          filter: `fields/Title eq '${task.Codigo}'`,
        });

        if (!links.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        const insumoIds = links
          .map((l) => l.IdInsumoProyecto)
          .filter(Boolean);

        if (!insumoIds.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        // 2. Traer los insumos del proyecto
        const insumos: InsumoProyecto[] = await insumoProyecto.getByIds(insumoIds);

        const entradas: TaskInsumoView[] = [];
        const salidas: TaskInsumoView[] = [];

        for (const ins of insumos) {
          const texto = ins.CategoriaInsumo ?? "";
          const view: TaskInsumoView = {
            id: ins.Id ?? "",
            title: ins.NombreInsumo,
            tipo: ins.TipoInsumo as "Entrada" | "Salida",
            texto,
            estado: texto ? "Subido" : "Pendiente",
          };

          if (view.tipo === "Entrada") entradas.push(view);
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

    load();

    return () => {
      cancelled = true;
    };
  }, [task, tareaInsumoProyecto, insumoProyecto]);

  return { inputs, outputs, loading, error };
}




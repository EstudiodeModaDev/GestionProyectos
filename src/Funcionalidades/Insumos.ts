import React from "react";
import { InsumoProyectoService } from "../services/InsumoProyecto.service";
import type {InsumoProyecto, plantillaInsumos, plantillaTareaInsumo, tareaInsumoProyecto,} from "../models/Insumos";
import type { TaskApertura } from "../models/AperturaTienda";
import type { PlantillaInsumoService } from "../services/PlantillaInsumos.service";
import type { PlantillaTareaInsumoService } from "../services/PlantillaTareaInsumo.service";
import type { TareaInsumoProyectoServicio } from "../services/TareaInsumoProyecto.service";
import { useGraphServices } from "../graph/graphContext";
import { FlowClient } from "./Flow";

/* =========================================================
   Tipos compartidos
   ========================================================= */

export type TaskInsumoView = {
  id: string;
  title: string;
  tipo: "Entrada" | "Salida";
  texto: string;
  estado: "Subido" | "Pendiente";
};

type SalidaFiles = Record<string, File>;

type FlowAttachment = {
  insumoId: Number;
  fileName: string;
  fileContent: string; // base64
};

/* =========================================================
   Flow client (una sola instancia)
   ========================================================= */

const FLOW_URL = "https://defaultcd48ecd97e154f4b97d9ec813ee42b.2c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/e980b31073244251b0cd225ac44fdbb1/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=l9hjxmIGNpz1gF7SU0ZhNjfjQp22CZwDPByt1nw3IYw";
const GET_URL = "https://defaultcd48ecd97e154f4b97d9ec813ee42b.2c.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/adb66fe637b44cca9830a6262899652c/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2lwtEm4Bh9D8mu91WkPRmaUcVzn-V8fgJxpNKK2PAYc";

const flowClient = new FlowClient(FLOW_URL);
const getClient = new FlowClient(GET_URL)

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] ?? result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

/* =========================================================
   usePlantillaInsumos
   ========================================================= */

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

  const loadInsumosPlantilla = React.useCallback(
    async (proceso: string): Promise<plantillaInsumos[]> => {
      setLoading(true);
      setError(null);
      try {
        const items = await insumosPlantillaSvc.getAll({filter: `fields/Proceso eq '${proceso}'`,});
        setInsumos(items);
        return items;
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
        setInsumos([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [insumosPlantillaSvc]
  );

  const handleSubmit = React.useCallback(async (proceso: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: plantillaInsumos = {
          Categoria: state.Categoria,
          Proceso: state.Proceso,
          Title: state.Title,
        }
        await insumosPlantillaSvc.create(payload)
        loadInsumosPlantilla(proceso)
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [insumosPlantillaSvc, state]
  );

  const handleEdit = React.useCallback(async (Id: string, proceso: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: plantillaInsumos = {
          Categoria: state.Categoria,
          Proceso: state.Proceso,
          Title: state.Title,
        }
        await insumosPlantillaSvc.update(Id, payload)
        await loadInsumosPlantilla(proceso)
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [insumosPlantillaSvc, state]
  );

  const deleteInsumo = React.useCallback(async (Id: string, proceso: string) => {
      setLoading(true);
      setError(null);
      try {
        await insumosPlantillaSvc.delete(Id)
        await loadInsumosPlantilla(proceso)
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [insumosPlantillaSvc]
  );

  return {
    loading, error, state, insumos, setField, loadInsumosPlantilla, handleSubmit, handleEdit, deleteInsumo
  };
}

/* =========================================================
   useTareaPlantillaInsumo
   ========================================================= */

export function useTareaPlantillaInsumo(plantillaTareaInsumoSvc: PlantillaTareaInsumoService) {
  const [insumos, setInsumos] = React.useState<plantillaTareaInsumo[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<plantillaTareaInsumo>({
    IdInsumo: "",
    Proceso: "",
    TipoInsumo: "",
    Title: "",
  });

  const setField = <K extends keyof plantillaTareaInsumo>(k: K, v: plantillaTareaInsumo[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadTareaInsumosPlantilla = React.useCallback(
    async (proceso: string): Promise<plantillaTareaInsumo[]> => {
      setLoading(true);
      setError(null);
      try {
        const items = await plantillaTareaInsumoSvc.getAll({filter: `fields/Proceso eq '${proceso}'`,});
        setInsumos(items);
        return items;
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
        setInsumos([]);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [plantillaTareaInsumoSvc]
  );

  const handleSubmit = React.useCallback(async (proceso: string) => {
      setLoading(true);
      setError(null);
      try {
        const payload: plantillaTareaInsumo = {
          IdInsumo: state.IdInsumo,
          Proceso: proceso,
          TipoInsumo: state.TipoInsumo,
          Title: state.Title,
        }
        await plantillaTareaInsumoSvc.create(payload)
        loadTareaInsumosPlantilla(proceso)
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [plantillaTareaInsumoSvc, state]
  );

  const createLink = React.useCallback(
    async (proceso: string, taskCode: string, insumoId: string, tipoUso: "Entrada" | "Salida") => {
      setLoading(true);
      setError(null);
      try {
        const payload: plantillaTareaInsumo = {
          IdInsumo: insumoId,
          Proceso: proceso,
          TipoInsumo: tipoUso,
          Title: taskCode,          // aquí guardamos el Código de la tarea
        };
        await plantillaTareaInsumoSvc.create(payload);
        await loadTareaInsumosPlantilla(proceso);
      } catch (e: any) {
        setError(e?.message ?? "Error creando relación tarea–insumo");
      } finally {
        setLoading(false);
      }
    },
    [plantillaTareaInsumoSvc, loadTareaInsumosPlantilla]
  );

 const deleteLink = React.useCallback(async (Id: string, proceso: string) => {
      setLoading(true);
      setError(null);
      try {
        await plantillaTareaInsumoSvc.delete(Id)
        await loadTareaInsumosPlantilla(proceso)
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tareas");
      } finally {
        setLoading(false);
      }
    },
    [plantillaTareaInsumoSvc]
  );

  return {
    loading, error, state, insumos, setField, loadTareaInsumosPlantilla, handleSubmit, deleteLink, createLink
  };
}

/* =========================================================
   useInsumosProyecto
   ========================================================= */

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
    setLoading(true);
    setError(null);
    try {
      const items = await insumosProyectoSvc.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando insumos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [insumosProyectoSvc]);

  React.useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const applyRange = React.useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const reloadAll = applyRange;

  const saveInsumo = async (e: React.FormEvent, id: string, texto: string) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await insumosProyectoSvc.update(id, { Texto: texto });
      alert("Se ha actualizado el registro con éxito");
      return updated;
    } finally {
      setLoading(false);
    }
  };

  const createAllInsumosFromTemplate = async (e: React.FormEvent, templateInsumos: plantillaInsumos[], idProyecto: string) => {
    e.preventDefault();

    if (!templateInsumos || templateInsumos.length === 0) {
      alert("No hay insumos definidos para esta plantilla");
      return { ok: false, data: {} as Record<string, string> };
    }

    setLoading(true);
    const mapByCodigo: Record<string, string> = {};

    try {
      for (const item of templateInsumos) {
        const payload: InsumoProyecto = {
          CategoriaInsumo: item.Categoria,
          IdInsumo: item.Id ?? "",
          Texto: "",
          TipoInsumo: item.Categoria,
          Title: idProyecto,
          NombreInsumo: item.Title,
        };

        const insumoCreated = await insumosProyectoSvc.create(payload);
        if (item.Id && insumoCreated.Id) {
          mapByCodigo[item.Id] = insumoCreated.Id;
        }
      }
    } catch (e) {
      console.error("Error creando insumos proyecto ", e);
    } finally {
      setLoading(false);
    }

    return { ok: true, data: mapByCodigo };
  };

  /* ----------- adjuntos vía Flow: varios archivos a la vez ----------- */

  const saveInsumoFiles = async (filesByInsumo: SalidaFiles) => {
    setLoading(true);
    try {
      const entries = Object.entries(filesByInsumo).filter(
        ([, file]) => !!file
      );

      if (!entries.length) {
        return { ok: false, message: "No hay archivos para enviar" };
      }

      const attachments: FlowAttachment[] = await Promise.all(
        entries.map(async ([insumoId, file]) => ({
          insumoId: Number(insumoId),
          fileName: file.name,
          fileContent: await fileToBase64(file),
        }))
      );

      const flujoResponse = await flowClient.invoke<{ attachments: FlowAttachment[] }, any>({attachments,});

      if(flujoResponse.ok){
        await Promise.all(entries.map(([insumoId, file]) => insumosProyectoSvc.update(insumoId, { Texto: file.name }))) 
      } else {
        alert("Ha ocurrido un error subiendo los archivos, por favor vuelva a intentarlo")
      }
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  const getInsumosFiles = async (Id: Number) => {
    setLoading(true);
    try {
      const flujoResponse = await getClient.invoke<{ Id: Number}, any>({Id});

      if(flujoResponse.ok){
        return flujoResponse.items
      } else {
        alert("Ha ocurrido un error subiendo los archivos, por favor vuelva a intentarlo")
        return[]
      }
    } finally {
      setLoading(false);
    }
  };

  // helper para un solo file (compatibilidad con llamadas antiguas)
  const saveInsumoFile = async (insumoId: string, file: File) => saveInsumoFiles({ [insumoId]: file });

   return {rows, loading, error, state, setField, loadFirstPage, applyRange, reloadAll, saveInsumo, createAllInsumosFromTemplate, saveInsumoFiles, saveInsumoFile, getInsumosFiles,};
}

/* =========================================================
   useTareaInsumoProyecto
   ========================================================= */

export function useTareaInsumoProyecto(tareaInsumoProyectoSvc: TareaInsumoProyectoServicio) {
  const [rows, setRows] = React.useState<tareaInsumoProyecto[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<tareaInsumoProyecto>({
    IdInsumoProyecto: "",
    TipoUso: "",
    Title: "",
  });

  const setField = <K extends keyof tareaInsumoProyecto>(k: K, v: tareaInsumoProyecto[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await tareaInsumoProyectoSvc.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tareaInsumoProyectoSvc]);

  React.useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const applyRange = React.useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const reloadAll = applyRange;

  const createAllInsumosTareaFromTemplate = async (e: React.FormEvent, templateInsumos: plantillaTareaInsumo[], data: Record<string, string>) => {
    e.preventDefault();

    if (!templateInsumos || templateInsumos.length === 0) {
      alert("No hay insumos plantillaTareaInsumo definidos");
      return { ok: false, data: [] as any[] };
    }

    setLoading(true);

    try {
      for (const item of templateInsumos) {
        const payload: tareaInsumoProyecto = {
          IdInsumoProyecto: data[item.IdInsumo!],
          TipoUso: item.TipoInsumo,
          Title: item.Title,
        };

        await tareaInsumoProyectoSvc.create(payload);
      }
    } catch (e) {
      console.error("Error creando vínculos tarea-insumo ", e);
    } finally {
      setLoading(false);
    }

    return { ok: true };
  };

  return {rows, loading, error, state, setField, loadFirstPage, applyRange, reloadAll, createAllInsumosTareaFromTemplate,};
}

/* =========================================================
   useTaskInsumos
   ========================================================= */

export function useTaskInsumos(task: TaskApertura | null) {
  const { insumoProyecto, tareaInsumoProyecto } = useGraphServices();
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
        const links: tareaInsumoProyecto[] = await tareaInsumoProyecto.getAll({filter: `fields/Title eq '${task.Codigo}'`,});

        if (!links.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        const insumoIds = links.map((l) => l.IdInsumoProyecto).filter(Boolean);

        if (!insumoIds.length) {
          if (!cancelled) {
            setInputs([]);
            setOutputs([]);
          }
          return;
        }

        const insumos: InsumoProyecto[] = await insumoProyecto.getByIds(insumoIds);

        const insumoMap = new Map<string, InsumoProyecto>(
          insumos.filter((i): i is InsumoProyecto => !!i.Id).map((i) => [String(i.Id), i])
        );

        const entradas: TaskInsumoView[] = [];
        const salidas: TaskInsumoView[] = [];

        for (const link of links) {
          const ins = insumoMap.get(String(link.IdInsumoProyecto));
          if (!ins) continue;

          const texto = ins.Texto ?? "";
          const tipoUso = (link.TipoUso as "Entrada" | "Salida") || "Entrada";

          const view: TaskInsumoView = {
            id: ins.Id ?? link.IdInsumoProyecto,
            title: ins.NombreInsumo || `Insumo ${ins.IdInsumo}`,
            tipo: tipoUso,
            texto,
            estado: texto ? "Subido" : "Pendiente",
          };

          if (tipoUso === "Entrada") entradas.push(view);
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
  }, [task, tareaInsumoProyecto, insumoProyecto]);

  const pendientesSalida = outputs.filter((o) => o.estado === "Pendiente");

  return { inputs, outputs, loading, error, pendientesSalida };
}

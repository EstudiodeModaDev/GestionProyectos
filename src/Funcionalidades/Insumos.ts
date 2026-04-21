import React from "react";
import { InsumoProyectoService } from "../services/InsumoProyecto.service";
import type {InsumoProyecto, plantillaInsumos, plantillaTareaInsumo, tareaInsumoProyecto,} from "../models/Insumos";
import type { projectTasks } from "../models/AperturaTienda";
import type { PlantillaInsumoService } from "../services/PlantillaInsumos.service";
import type { PlantillaTareaInsumoService } from "../services/PlantillaTareaInsumo.service";
import type { TareaInsumoProyectoServicio } from "../services/TareaInsumoProyecto.service";
import { useGraphServices } from "../graph/graphContext";
import { normalize } from "../utils/commons";
import { useInsumosAttachment } from "./Attachments/Library/useInsumosAttachments";
import type { Archivo } from "../models/Files";

/* =========================================================
   Tipos compartidos
   ========================================================= */

export type TaskInsumoView = {
  id: string;
  title: string;
  tipo: string;
  texto: string;
  estado: "Subido" | "Pendiente";
  fase?: string
};

type SalidaFiles = Record<string, File>;
const TASK_INPUT_LINK_CREATION_CONCURRENCY = 10;
const INPUT_LINK_RETRY_COUNT = 4;
const INPUT_LINK_RETRY_DELAY_MS = 300;

/**
 * Administra los insumos de plantilla asociados a un proceso.
 * @param insumosPlantillaSvc - Servicio de acceso a insumos plantilla.
 * @returns Estado, formulario y operaciones CRUD del módulo.
 */



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
    OpcionesJson: "",
    PreguntaFlujo: false
  });

  

/**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof plantillaInsumos>(k: K, v: plantillaInsumos[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadInsumosPlantilla = React.useCallback(async (proceso: string): Promise<plantillaInsumos[]> => {
      setLoading(true);
      setError(null);
      try {
        const items = (await insumosPlantillaSvc.getAll({filter: `fields/Proceso eq '${proceso}'`,})).items;
        console.log(items)
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
          OpcionesJson: state.OpcionesJson,
          PreguntaFlujo: state.PreguntaFlujo,
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
          OpcionesJson: state.OpcionesJson,
          PreguntaFlujo: state.PreguntaFlujo,
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

/**
 * Administra las relaciones entre tareas plantilla e insumos plantilla.
 * @param plantillaTareaInsumoSvc - Servicio de acceso a relaciones tarea-insumo plantilla.
 * @returns Estado, formulario y operaciones CRUD del módulo.
 */


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
    Obligatorio: "",
    OrdenPregunta: "",
  });

  

/**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof plantillaTareaInsumo>(k: K, v: plantillaTareaInsumo[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadTareaInsumosPlantilla = React.useCallback(
    async (proceso: string): Promise<plantillaTareaInsumo[]> => {
      setLoading(true);
      setError(null);
      try {
        const items = (await plantillaTareaInsumoSvc.getAll({filter: `fields/Proceso eq '${proceso}'`, top:4000})).items;
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
          Obligatorio: state.Obligatorio,
          OrdenPregunta: state.OrdenPregunta
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

  const createLink = React.useCallback(async (proceso: string, taskCode: string, insumoId: string, tipoUso: "Entrada" | "Salida") => {
      setLoading(true);
      setError(null);
      try {
        const payload: plantillaTareaInsumo = {
          IdInsumo: insumoId,
          Proceso: proceso,
          TipoInsumo: tipoUso,
          Title: taskCode,    
          Obligatorio: "",
          OrdenPregunta: "",
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

/**
 * Administra los insumos concretos creados para un proyecto.
 * @param insumosProyectoSvc - Servicio de acceso a insumos de proyecto.
 * @returns Estado, colección y operaciones sobre insumos del proyecto.
 */


/* =========================================================
   useInsumosProyecto
   ========================================================= */

export function useInsumosProyecto(insumosProyectoSvc: InsumoProyectoService) {
  const insumosAttachments = useInsumosAttachment()
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
    insumoId: ""
  });

  const graph = useGraphServices()

  

/**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof InsumoProyecto>(k: K, v: InsumoProyecto[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = (await insumosProyectoSvc.getAll()).items;
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando insumos");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [insumosProyectoSvc]);

  const applyRange = React.useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const reloadAll = applyRange;

  

/**
   * Guarda el texto de un insumo existente.
   * @param e - Evento del formulario.
   * @param id - Identificador del insumo.
   * @param texto - Nuevo texto a persistir.
   * @returns Insumo actualizado.
   */
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

  

/**
   * Crea todos los insumos de proyecto a partir de una plantilla base.
   * @param e - Evento del formulario.
   * @param plantillaInsumosArr - Insumos plantilla a materializar.
   * @param proyectoId - Proyecto destino.
   * @returns Resultado de creación y mapa entre plantilla e insumo creado.
   */
  const createAllInsumosFromTemplate = async (e: React.FormEvent, plantillaInsumosArr: plantillaInsumos[], proyectoId: string) => {
    e.preventDefault();

    if (!plantillaInsumosArr || plantillaInsumosArr.length === 0) {
      alert("No hay plantillaInsumos definidos");
      return { ok: false, data: {} as Record<string, string> };
    }

    setLoading(true);

    const map: Record<string, string> = {};

    try {
      for (const p of plantillaInsumosArr) {
        const payload: InsumoProyecto = {
          Title: proyectoId,
          IdInsumo: String(p.Id ?? ""),
          TipoInsumo: "",
          CategoriaInsumo: p.Categoria,
          Texto: "",
          NombreInsumo: p.Title,
          insumoId: ""
        };

        const creado = await insumosProyectoSvc.create(payload);
        const plantillaId = String(p.Id ?? "").trim();
        const creadoId = String((creado as any)?.Id ?? "").trim();

        if (!plantillaId || !creadoId) {
          console.warn("No pude mapear insumo plantilla -> creado", { p, creado });
          continue;
        }

        map[plantillaId] = creadoId;
      }

      return { ok: true, data: map };
    } catch (err) {
      console.error("Error creando InsumoProyecto desde plantilla", err);
      return { ok: false, data: {} as Record<string, string> };
    } finally {
      setLoading(false);
    }
  };
  /* ----------- adjuntos vía Flow: varios archivos a la vez ----------- */

  

/**
   * Sube múltiples archivos y los asocia a sus insumos correspondientes.
   * @param filesByInsumo - Mapa de archivos indexado por identificador de insumo.
   * @returns Resultado de la carga masiva.
   */
  const saveInsumoFiles = async (filesByInsumo: SalidaFiles,) => {
    setLoading(true);
    try {
      const entries = Object.entries(filesByInsumo).filter(
        ([, file]) => !!file
      ) as [string, File][];

      if (!entries.length) {
        return { ok: false, message: "No hay archivos para enviar" };
      }

      const uploadedFiles = await Promise.all(
        entries.map(async ([insumoId, file]) => {
          const path = `/`; // ajústalo a la ruta real
          const uploaded = await insumosAttachments.handleUploadClick(path, file,file.name + "(" + "Insumo de la tarea " + insumoId + ")");

          if (!uploaded) {
            throw new Error(`No se pudo subir el archivo del insumo ${insumoId}`);
          }

          await insumosProyectoSvc.update(insumoId, {Texto: file.name, insumoId: uploaded.id});

          return {
            insumoId,
            uploaded,
          };
        })
      );

      return { ok: true, uploadedFiles };
    } catch (e: any) {
      console.error(e);
      alert("Ha ocurrido un error subiendo los archivos, por favor vuelva a intentarlo");
      return { ok: false, message: e?.message ?? "Error desconocido" };
    } finally {
      setLoading(false);
    }
  };

  

/**
   * Guarda el texto capturado para un insumo.
   * @param idInsumo - Identificador del insumo.
   * @param text - Texto a persistir.
   * @returns Estado simple de la operación.
   */
  const saveInsumoText = async (idInsumo: string, text: string) => {
    setLoading(true);
    try {
      await insumosProyectoSvc.update(idInsumo, {Texto: text}) 
      return { ok: true };
    } finally {
      setLoading(false);
    }
  };

  

/**
   * Carga los archivos asociados a un insumo.
   * @param insumoId - Identificador del insumo.
   * @returns Archivos encontrados.
   */
  const loadInsumosFiles = async (insumoId: string,): Promise<Archivo[]> => {
    try {

      const insumosProyectos: InsumoProyecto = await  graph.insumoProyecto.get(String(insumoId));
      console.log(insumosProyectos)

      if (!insumosProyectos) return [];

      const files = await insumosAttachments.reload([insumosProyectos]);

      return files ?? [];
    } catch (e: any) {
      console.error(e);
      alert("Error cargando archivos de insumos: " + e.message);
      return [];
    }
  };
  // helper para un solo file (compatibilidad con llamadas antiguas)
  

/**
   * Sube un único archivo y lo vincula a un insumo.
   * @param insumoId - Identificador del insumo.
   * @param file - Archivo a subir.
   * @returns Resultado de la carga.
   */
  const saveInsumoFile = async (insumoId: string, file: File,) => saveInsumoFiles({ [insumoId]: file },);

   return {saveInsumoText, rows, loading, error, state, setField, loadFirstPage, applyRange, reloadAll, saveInsumo, createAllInsumosFromTemplate, saveInsumoFiles, saveInsumoFile, loadInsumosFiles,};
}

/**
 * Administra las relaciones entre tareas de proyecto e insumos reales.
 * @param tareaInsumoProyectoSvc - Servicio de acceso a vínculos tarea-insumo.
 * @returns Estado, formulario y operaciones del módulo.
 */


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
    ProyectoId: ""
  });
  const graph = useGraphServices()

  const wait = React.useCallback(
    (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms)),
    []
  );

  

/**
   * Actualiza un campo del formulario.
   * @param k - Campo a modificar.
   * @param v - Nuevo valor del campo.
   */
  const setField = <K extends keyof tareaInsumoProyecto>(k: K, v: tareaInsumoProyecto[K]) => setState((s) => ({ ...s, [k]: v }));

  const loadFirstPage = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = (await tareaInsumoProyectoSvc.getAll()).items;
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [tareaInsumoProyectoSvc]);

  const applyRange = React.useCallback(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const reloadAll = applyRange;

  

/**
   * Crea los vínculos tarea-insumo a partir de una plantilla.
   * @param e - Evento del formulario.
   * @param templateInsumos - Vínculos de plantilla a materializar.
   * @param mapPlantillaToCreado - Mapa entre insumo plantilla e insumo real creado.
   * @param proyectoId - Proyecto destino.
   * @returns Resultado general de la operación.
   */
  const createAllInsumosTareaFromTemplate = async (
    e: React.FormEvent,
    templateInsumos: plantillaTareaInsumo[],
    mapPlantillaToCreado: Record<string, string>, // ✅ clave del arreglo anterior
    proyectoId: string
  ) => {
    e.preventDefault();

    if (!templateInsumos || templateInsumos.length === 0) {
      alert("No hay insumos plantillaTareaInsumo definidos");
      return { ok: false, data: [] as any[] };
    }

    setLoading(true);

    try {
      for (let i = 0; i < templateInsumos.length; i += TASK_INPUT_LINK_CREATION_CONCURRENCY) {
        const batch = templateInsumos.slice(i, i + TASK_INPUT_LINK_CREATION_CONCURRENCY);

        await Promise.all(
          batch.map(async (item) => {
        const plantillaInsumoId = String(item.IdInsumo ?? "").trim();
        const idRealInsumoProyecto = mapPlantillaToCreado[plantillaInsumoId];

        if (!idRealInsumoProyecto) {
          console.warn(
            "No hay Id real de InsumoProyecto para este insumo de plantilla:",
            { plantillaInsumoId, item, mapPlantillaToCreado }
          );
          return; // o throw si debe ser obligatorio
        }

        const payload: tareaInsumoProyecto = {
          IdInsumoProyecto: idRealInsumoProyecto, // ✅ ID REAL CREADO
          TipoUso: item.TipoInsumo,
          Title: item.Title,                      // Id de la tarea creada (según tu modelo)
          ProyectoId: proyectoId,
        };

        await tareaInsumoProyectoSvc.create(payload);
          })
        );
      }

      return { ok: true };
    } catch (err) {
      console.error("Error creando vínculos tarea-insumo", err);
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  type FaseInsumo = "Entrada" | "Salida" | "Ambas";

  

/**
   * Obtiene los insumos asociados a una tarea según la fase solicitada.
   * @param proyectoId - Identificador del proyecto.
   * @param taskId - Identificador o código de la tarea.
   * @param fase - Fase a filtrar: entrada, salida o ambas.
   * @returns Insumos únicos asociados a la tarea.
   */
  const getInsumosParaSubir = async (proyectoId: string, taskId: string, fase: FaseInsumo = "Ambas"): Promise<InsumoProyecto[]> => {
    for (let attempt = 0; attempt < INPUT_LINK_RETRY_COUNT; attempt++) {
      let relaciones = (await graph.tareaInsumoProyecto.getAll({filter: `fields/Title eq '${taskId}' and fields/ProyectoId eq '${proyectoId}'`, top: 4000,})).items;

      if (fase !== "Ambas") {
        relaciones = relaciones.filter((rel: tareaInsumoProyecto) => {
          const tipoUso = normalize(rel?.TipoUso);
          return tipoUso === normalize(fase);
        });
      }

      if (relaciones.length > 0) {
        const insumos = await Promise.all(
          relaciones.map(async (rel: tareaInsumoProyecto) => {
            const idInsumoProyecto = rel?.IdInsumoProyecto;
            if (!idInsumoProyecto) return null;

            try {
              const ins = await graph.insumoProyecto.get(String(idInsumoProyecto));
              return ins ?? null;
            } catch {
              return null;
            }
          })
        );

        const result = insumos.filter(Boolean) as InsumoProyecto[];
        const uniq = new Map<string, InsumoProyecto>();
        for (const it of result) {
          const id = String((it as any)?.Id ?? (it as any)?.fields?.Id ?? "");
          if (id && !uniq.has(id)) uniq.set(id, it);
        }

        const uniqueItems = [...uniq.values()];
        if (uniqueItems.length > 0) return uniqueItems;
      }

      if (attempt < INPUT_LINK_RETRY_COUNT - 1) {
        await wait(INPUT_LINK_RETRY_DELAY_MS);
      }
    }

    return [];
  };

  return {rows, loading, error, state, setField, loadFirstPage, applyRange, reloadAll, createAllInsumosTareaFromTemplate, getInsumosParaSubir};
}

/**
 * Resuelve los insumos de entrada y salida visibles para una tarea.
 * @param task - Tarea actual.
 * @returns Insumos organizados por fase y estado de carga.
 */


/* =========================================================
   useTaskInsumos
   ========================================================= */

export function useTaskInsumos(task: projectTasks | null) {
  const { insumoProyecto, tareaInsumoProyecto,} = useGraphServices();
  const [inputs, setInputs] = React.useState<TaskInsumoView[]>([]);
  const [outputs, setOutputs] = React.useState<TaskInsumoView[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!task) return;
    let cancelled = false;

    

/**
     * Carga insumos y clasifica entradas y salidas para la tarea actual.
     */
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const links: tareaInsumoProyecto[] = (await tareaInsumoProyecto.getAll({filter: `fields/Title eq '${task.Codigo}' and fields/ProyectoId eq '${task.IdProyecto}'`,})).items;

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
          const tipoUso = ins.CategoriaInsumo;
          const fase = (link.TipoUso as "Entrada" | "Salida") || "Entrada"
          
          const view: TaskInsumoView = {
            id: ins.Id ?? link.IdInsumoProyecto,
            title: ins.NombreInsumo || `Insumo ${ins.IdInsumo}`,
            tipo: tipoUso,
            texto,
            estado: texto ? "Subido" : "Pendiente",
            fase
          };

          if (fase === "Entrada") entradas.push(view);
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

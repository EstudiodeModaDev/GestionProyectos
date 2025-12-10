import React from "react";
import type { apertura, TaskApertura } from "../models/AperturaTienda";
import type { TareasProyectosService } from "../services/Tasks.service";
import { calcularFechaSolucionPorDias } from "../utils/commons";
import type { Holiday } from "festivos-colombianos";
import { TZDate } from "@date-fns/tz";
import { fetchHolidays } from "./Holidays";
import { toGraphDateTime } from "../utils/Date";
import type { ProjectSP } from "../models/Projects";
import type { GetAllOpts } from "../models/commons";
import { useAuth } from "../auth/authProvider";

export function useTasks(tasksSvc: TareasProyectosService) {
  const [onGoingTasks, setOnGoingTasks] = React.useState<TaskApertura[]>([]);
  const [task, setTask] = React.useState<TaskApertura[]>([]);
  const [search, setSearch] = React.useState<string>("");
  const [responsable, setResponsable] = React.useState<string>("");
  const [estado, setEstado] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<TaskApertura>({
    Codigo: "",
    CorreoResponsable: "",
    Dependencia: "",
    Diaspararesolver: "",
    Phase: "",
    Responsable: "",
    TipoTarea: "",
    Title: "",
    IdProyecto: "",
    FechaResolucion: "",
    Estado: "",
    FechaCierre: null
  });
  const [holidays, setHolidays] = React.useState<Holiday[]>([])
  const setField = <K extends keyof TaskApertura>(k: K, v: TaskApertura[K]) => setState((s) => ({ ...s, [k]: v }));
  const {account} = useAuth();


  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const hs = await fetchHolidays();
        if (!cancel) setHolidays(hs);
      } catch (e) {
        if (!cancel) console.error("Error festivos:", e);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);
  
  const loadTasksOnGoing = React.useCallback(async (onGoingProjects: ProjectSP[]) => {
    setLoading(true); setError(null);
    try {
      let Task: TaskApertura[] = []
      
      for (const item of onGoingProjects) {
        const items = await tasksSvc.getAll({top: 10000, filter: `fields/IdProyecto eq '${item.Id}'`});
        for(const tarea of items){
          Task.push(tarea)
        } 
      }
      setOnGoingTasks(Task);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setOnGoingTasks([]);
    } finally {
      setLoading(false);
    }
  }, [tasksSvc]);

  function calcularFechaTarea(tareaCodigo: string, tareas: apertura[], fechaInicioProyecto: Date, holidays: Holiday[]): TZDate {
    const TIMEZONE = "America/Bogota";

    const mapa = new Map<string, apertura>(
      tareas.map(t => [t.Codigo, t])
    );

    // memo para no recalcular lo mismo mil veces
    const cache = new Map<string, TZDate>();

    function fechaFin(codigo: string): TZDate {
      if (cache.has(codigo)) return cache.get(codigo)!;

      const t = mapa.get(codigo);
      if (!t) throw new Error(`No encontré la tarea ${codigo}`);

      // 1) Base: o el inicio del proyecto o el fin de la tarea de la que depende
      let base: Date | TZDate;

      if (t.Dependencia) {
        const finDep = fechaFin(t.Dependencia); // recursivo ✨
        base = finDep;
      } else {
        base = new TZDate(fechaInicioProyecto, TIMEZONE);
      }

      // 2) Sumar sus días hábiles
      const fin = calcularFechaSolucionPorDias(base, Number(t.Diaspararesolver), holidays);
      cache.set(codigo, fin);
      return fin;
    }

    return fechaFin(tareaCodigo);
  }

  const createAllTemplate = async (e: React.FormEvent, templateTasks: apertura[], IdProyecto: string, fechaInicioProyecto: Date) => {
    e.preventDefault();

    if (!templateTasks || templateTasks.length === 0) {
      alert("No hay tareas definidas para esta plantilla");
      return {
        ok: false,
        data: []
      };
    }

    setLoading(true)
    const tareasCreadas: string[] = [];
    const mapByCodigo: Record<string, string> = {}; 

    try{
      for (const item of templateTasks) {
        const fechaSolucion = calcularFechaTarea(item.Codigo, templateTasks, fechaInicioProyecto, holidays);

        const payload: TaskApertura = {
          Codigo: item.Codigo,
          CorreoResponsable: item.CorreoResponsable,
          Dependencia: item.Dependencia,
          Diaspararesolver: item.Diaspararesolver,
          IdProyecto,
          Phase: item.Phase,
          Responsable: item.Responsable,
          TipoTarea: item.TipoTarea,
          Title: item.Title,
          FechaResolucion: toGraphDateTime(fechaSolucion)!,
          Estado: "Incompleta",
          FechaCierre: null
        };

        const tarea = await tasksSvc.create(payload); // aquí sí se espera bien
        tareasCreadas.push(tarea.Codigo);
        mapByCodigo[item.Codigo] = tarea.Id!; 
      }
    } catch (e) {
      console.error("Se ha producido un error creando las tareas ", e)
    } finally {
      setLoading(false)
    }
    return {
      ok: true,
      data: tareasCreadas
    };
  };

  const buildFilter = React.useCallback((IdProyecto: string): GetAllOpts => {
    const filters: string[] = [];

    filters.push(`fields/IdProyecto eq '${IdProyecto}'`);

    if (search) {
      filters.push(`startswith(fields/Title, '${search}')`);
    } 

    if (responsable) {
      filters.push(`(startswith(fields/Responsable, '${responsable}') or startswith(fields/CorreoResponsable, '${responsable}'))`);
    } 

    if (estado === false) {
      filters.push(`fields/Estado eq 'Incompleta'`);
    }

    return {
      filter: filters.join(" and "),
      top: 20000,
    };
  }, [estado, responsable, search,]); 

  const loadProyecTasks = React.useCallback(async (IdProyecto: string) => {
    setLoading(true); setError(null);
    try {
      const items = await tasksSvc.getAll(buildFilter(IdProyecto));
      console.log("items")
      console.table(items)

      setTask(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
      setTask([]);
    } finally {
      setLoading(false);
    }
  }, [tasksSvc, buildFilter]);

  const updateTaskPhase = React.useCallback(async (IdTask: string, newPhase: string, IdProyecto: string) => {
    setLoading(true); setError(null);
    try {
      const updated = await tasksSvc.update(IdTask, {Phase: newPhase})
      console.log(updated)
      loadProyecTasks(IdProyecto)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tareas");
    } finally {
      setLoading(false);
    }
  }, [tasksSvc]);

  const searchPredecessor = React.useCallback(async (dependenciaId: string | null): Promise<TaskApertura | null> => {
      if (!dependenciaId) return null;
      setLoading(true);
      setError(null);
      try {
        const items = await tasksSvc.getAll({filter: `fields/Codigo eq '${dependenciaId}'`,  top: 1,});
        return items[0] ?? null;
      } catch (e: any) {
        setError(e?.message ?? "Error cargando predecesor");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [tasksSvc]
  );

  const searchSuccesor = React.useCallback(async (taskId: string | null): Promise<TaskApertura[]> => {
      setLoading(true);
      setError(null);
      try {
        const items = await tasksSvc.getAll({filter: `fields/Dependencia eq '${taskId}'`,});
        return items
      } catch (e: any) {
        setError(e?.message ?? "Error cargando predecesor");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [tasksSvc]
  );

  const selfAssign = React.useCallback(async (taskId: string | null) => {
      setLoading(true);
      setError(null);
      try {
        await tasksSvc.update(taskId!, {CorreoResponsable: account?.username ?? "", Responsable: account?.name ?? ""});
        alert("Te has asignado la tarea correctamente");
      } catch (e: any) {
        setError(e?.message ?? "Error asignando tarea");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [tasksSvc]
  );

  const unassignTasks = React.useCallback(async (projectId: string | null) => {
      setLoading(true);
      setError(null);
      try {
        const cantidad = (await tasksSvc.getAll({filter: `fields/IdProyecto eq '${projectId}' and fields/CorreoResponsable eq ''`, top: 20000})).lenght
        return cantidad
      } catch (e: any) {
        setError(e?.message ?? "Error asignando tarea");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [tasksSvc]
  );

  const setComplete = React.useCallback(async (task: TaskApertura): Promise<{ok: boolean, percent:number}> => {
      setLoading(true);
      setError(null);
      try {
        if(task.Responsable !== account?.name!){
          alert("No puedes completar una tarea que no te has asignado");
          return {
            ok: false,
            percent: 0
          }
        } else {
          await tasksSvc.update(task.Id!, {Estado: "Completada", FechaCierre: toGraphDateTime(new Date())});
          const finishedTasks = (await tasksSvc.getAll({filter: `fields/IdProyecto eq '${task.IdProyecto}' and fields/Estado eq 'Completada'`, top: 20000})).length
          const totalTasks = (await tasksSvc.getAll({filter: `fields/IdProyecto eq '${task.IdProyecto}'`, top: 20000})).length
          const percent = Math.round((finishedTasks / totalTasks) * 100)
          alert("Tarea completada correctamente");
          return {
            ok: true,
            percent
          }
        }
        
      } catch (e: any) {
        setError(e?.message ?? "Error asignando tarea");
        return {
          ok: false,
          percent: 0
        }
      } finally {
        setLoading(false);
      }
    },
    [tasksSvc]
  );

  return {
    loading, error, state, onGoingTasks, task, estado, search, responsable, 
    loadTasksOnGoing, setField, createAllTemplate, loadProyecTasks, setResponsable, setSearch, setEstado, updateTaskPhase, searchPredecessor, searchSuccesor, selfAssign, unassignTasks, setComplete
  };
}
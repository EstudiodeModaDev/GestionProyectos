import React from "react";
import type { ProjectSP } from "../../../models/Projects";
import type { projectTasks, taskResponsible } from "../../../models/AperturaTienda";
import { ParseDateShow } from "../../../utils/Date";
import { getDeviationInDays, toDay } from "../utils/dateUtils";
import { isBlockedTask, isCompletedTask } from "../utils/taskStateUtils";
import type {
  DesviacionStatusMeta,
  TaskColumnFilters,
  TaskRowView,
} from "../../../Components/Desviacion/types";

type Params = {
  project: ProjectSP;
  projectTasksList: projectTasks[];
  filters: TaskColumnFilters;
  responsablesByTaskId: Record<string, taskResponsible[]>;
};

/**
 * Calcula métricas y vistas derivadas para el tablero de desviación.
 * @param params - Proyecto, tareas, filtros y responsables ya resueltos.
 * @returns Colecciones y métricas listas para renderizar en la vista.
 */
export function useDesviacionMetrics({
  project,
  projectTasksList,
  filters,
  responsablesByTaskId,
}: Params) {
  /**
   * Tareas visibles luego de aplicar los filtros de la vista.
   */
  const filteredTasks = React.useMemo(() => {
    return projectTasksList.filter((task) => {
      const taskTitle = task.Title?.trim() || "Sin tarea";
      const taskArea = task.AreaResponsable?.trim() || "Sin area";
      const taskEstado = task.Estado?.trim() || "Sin estado";
      const responsables = responsablesByTaskId[String(task.Id ?? "").trim()] ?? [];
      const responsable =
        responsables.length > 0
          ? responsables
              .map((item) => item.Title?.trim() || item.Correo?.trim() || "Sin responsable")
              .join(", ")
          : "Sin responsable";

      return (
        (filters.tarea === "all" || taskTitle === filters.tarea) &&
        (filters.area === "all" || taskArea === filters.area) &&
        (filters.responsable === "all" || responsable === filters.responsable) &&
        (filters.estado === "all" || taskEstado === filters.estado)
      );
    });
  }, [filters, projectTasksList, responsablesByTaskId]);

  /**
   * Filas normalizadas para la tabla principal de desviación.
   */
  const taskRows = React.useMemo<TaskRowView[]>(() => {
    return filteredTasks.map((task) => {
      const responsables = responsablesByTaskId[String(task.Id ?? "").trim()] ?? [];
      const responsable =
        responsables.length > 0
          ? responsables
              .map((item) => item.Title?.trim() || item.Correo?.trim() || "Sin responsable")
              .join(", ")
          : "Sin responsable";

      return {
        id: String(task.Id ?? task.Codigo ?? task.Title),
        tarea: task.Title,
        area: task.AreaResponsable?.trim() || "Sin area",
        responsable,
        estado: task.Estado || "Sin estado",
        observacion: task.razonBloqueo?.trim() || task.razonDevolucion?.trim() || "-",
        isBlocked: isBlockedTask(task.Estado),
      };
    });
  }, [filteredTasks, responsablesByTaskId]);

  /**
   * Opciones únicas derivadas para cada filtro de la interfaz.
   */
  const filterOptions = React.useMemo(() => {
    const tasks = new Set<string>();
    const areas = new Set<string>();
    const responsables = new Set<string>();
    const estados = new Set<string>();

    for (const task of projectTasksList) {
      tasks.add(task.Title?.trim() || "Sin tarea");
      areas.add(task.AreaResponsable?.trim() || "Sin area");
      estados.add(task.Estado?.trim() || "Sin estado");

      const assigned = responsablesByTaskId[String(task.Id ?? "").trim()] ?? [];
      const responsable =
        assigned.length > 0
          ? assigned
              .map((item) => item.Title?.trim() || item.Correo?.trim() || "Sin responsable")
              .join(", ")
          : "Sin responsable";

      responsables.add(responsable);
    }

    return {
      tarea: Array.from(tasks).sort((a, b) => a.localeCompare(b)),
      area: Array.from(areas).sort((a, b) => a.localeCompare(b)),
      responsable: Array.from(responsables).sort((a, b) => a.localeCompare(b)),
      estado: Array.from(estados).sort((a, b) => a.localeCompare(b)),
    };
  }, [projectTasksList, responsablesByTaskId]);

  /**
   * Porcentaje de tareas completadas a tiempo.
   */
  const cumplimientoProyecto = React.useMemo(() => {
    let cumplidas = 0;
    const total = filteredTasks.length;

    const finishedTasks = filteredTasks.filter((task) =>
      task.Estado?.toLowerCase().includes("completa")
    );

    for (const task of finishedTasks) {
      const plannedFinish = toDay(task.FechaResolucion);
      const realFinish = toDay(task.FechaCierre);

      if (!plannedFinish || !realFinish) continue;
      if (realFinish.getTime() <= plannedFinish.getTime()) {
        cumplidas++;
      }
    }

    return total > 0 ? (cumplidas / total) * 100 : 0;
  }, [filteredTasks]);

  /**
   * Avance global del proyecto según el valor persistido en SharePoint.
   */
  const avanceGlobal = React.useMemo(() => {
    const numeric = Number(project.Progreso);
    return Number.isNaN(numeric) ? 0 : numeric;
  }, [project.Progreso]);

  /**
   * Desviación promedio de las tareas visibles.
   */
  const desviacionPromedio = React.useMemo(() => {
    const values = filteredTasks
      .map(getDeviationInDays)
      .filter((value): value is number => value !== null);

    if (!values.length) return null;
    return values.reduce((acc, value) => acc + value, 0) / values.length;
  }, [filteredTasks]);

  /**
   * Estado resumido de desviación para la cabecera del tablero.
   */
  const desviacionMeta = React.useMemo<DesviacionStatusMeta>(() => {
    if (desviacionPromedio === null) {
      return { label: "Sin datos", detail: "No hay fechas para calcular", tone: "neutral" };
    }

    if (desviacionPromedio > 0) {
      return {
        label: "Retrasado",
        detail: `${desviacionPromedio.toFixed(1)} dias promedio`,
        tone: "danger",
      };
    }

    if (desviacionPromedio < 0) {
      return {
        label: "Adelantado",
        detail: `${Math.abs(desviacionPromedio).toFixed(1)} dias antes`,
        tone: "success",
      };
    }

    return { label: "En tiempo", detail: "Sin desviacion promedio", tone: "neutral" };
  }, [desviacionPromedio]);

  /**
   * Porcentaje de tareas completadas dentro del subconjunto filtrado.
   */
  const cumplimientoArea = React.useMemo(() => {
    if (!filteredTasks.length) return 0;

    const completed = filteredTasks.filter((task) => isCompletedTask(task.Estado)).length;
    return (completed / filteredTasks.length) * 100;
  }, [filteredTasks]);

  /**
   * Número de tareas bloqueadas dentro del filtro actual.
   */
  const blockedCount = React.useMemo(
    () => filteredTasks.filter((task) => isBlockedTask(task.Estado)).length,
    [filteredTasks]
  );

  /**
   * Texto resumen del estado general del filtro actual.
   */
  const summaryText = React.useMemo(() => {
    if (!filteredTasks.length) return "No hay tareas para el filtro seleccionado.";

    const completed = filteredTasks.filter((task) => isCompletedTask(task.Estado)).length;
    return `${completed} de ${filteredTasks.length} tareas completadas`;
  }, [filteredTasks]);

  /**
   * Etiqueta de la última fecha objetivo disponible entre las tareas filtradas.
   */
  const lastTargetDateLabel = React.useMemo(() => {
    const taskWithDate = filteredTasks.find((task) => task.FechaResolucion);
    return taskWithDate?.FechaResolucion
      ? ParseDateShow(taskWithDate.FechaResolucion)
      : "Sin fecha programada";
  }, [filteredTasks]);

  return {
    filteredTasks,
    taskRows,
    filterOptions,
    cumplimientoProyecto,
    avanceGlobal,
    desviacionMeta,
    cumplimientoArea,
    blockedCount,
    summaryText,
    lastTargetDateLabel,
  };
}

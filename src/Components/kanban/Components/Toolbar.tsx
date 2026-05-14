import React from "react";
import type { ProjectSP } from "../../../models/Projects";
import { ParseDateShow } from "../../../utils/Date";
import type { taskResponsible } from "../../../models/AperturaTienda";

type Props = {
  project: ProjectSP
  filters:{
   search: string
   setSearch: (s: string) => void

   responsable: string
   setResponsable: (s: string) => void

   soloIncompletas: boolean
   setSoloIncompletas: (s: boolean) => void
  }

  loading: boolean
  respByTaskId: Record<string, taskResponsible[]>;
  responsablesMap?: Record<string, string>
}

/**
 * Renderiza la cabecera del tablero Kanban con filtros y metadatos del proyecto.
 *
 * @param props - Proyecto activo, filtros y responsables disponibles.
 * @returns Encabezado con estado, fecha y controles de filtrado.
 */
const KanbanHeader: React.FC<Props> = ({project, filters, loading, respByTaskId, responsablesMap}) => {

  const allResponsablesKeys = React.useMemo(() => {
    const set = new Set<string>();
    for (const taskId of Object.keys(respByTaskId)) {
      for (const r of respByTaskId[taskId] ?? []) {
        const mail = (r.nombre ?? "").trim().toLowerCase();
        if (mail) set.add(mail);
      }
    }
    return Array.from(set).sort();
  }, [respByTaskId]);

  return (
    <>
      {/* HEADER PROYECTO */}
      <header className="kb-header">
        <div>
          <h1 className="kb-project-title">{project.nombre_proyecto}</h1>
          <p className="kb-project-id">ID proyecto: {project.id}</p>
        </div>

        <div className="kb-project-status">
          <div className="kb-pill">
            <span>{project.estado ?? "En curso"}</span>
          </div>
          <div className="kb-pill">
            <span>{project.progreso ?? 0}%</span>
          </div>
          <div className="kb-pill">
            <span>{ParseDateShow(project.fecha_inicio) ?? ""}</span>
          </div>
        </div>
      </header>

      {/* TOOLBAR */}
      <section className="kb-toolbar">
        <div className="kb-filter--search">
          <input 
            type="text" 
            placeholder="Buscar tarea por nombre o código…" 
            value={filters.search} 
            onChange={(e) => filters.setSearch(e.target.value)}
            className="filter-text"/>
        </div>

        <div className="kb-filter">
          <select value={filters.responsable} onChange={(e) =>  filters.setResponsable(e.target.value)} disabled={loading}>
            <option value="all">Todos los responsables</option>
            {allResponsablesKeys.map((mail) => (
              <option key={mail} value={mail}>{responsablesMap?.[mail] ?? mail}</option>
            ))}
          </select>
        </div>

        <div className="kb-toolbar-right">
          <label className="kb-toggle">
            <input type="checkbox" checked={filters.soloIncompletas} onChange={(e) => filters.setSoloIncompletas(e.target.checked)}/>
            <span className="kb-toggle-slider" />
            <span className="kb-toggle-label">Ver solo faltantes</span>
          </label>
        </div>
      </section>

   
    </>
  );
};

export default KanbanHeader;

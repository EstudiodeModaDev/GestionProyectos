import { NavLink } from "react-router-dom";
import type { ProjectSP } from "../../models/Projects";

type Props = {
  collapsed: boolean, 
  onToggleCollapse: () => void, 
  project: ProjectSP | null
}

/**
 * Renderiza la navegacion lateral principal del modulo.
 *
 * @param props - Estado de expansion y proyecto actualmente seleccionado.
 * @returns Sidebar con accesos a vistas generales y del proyecto activo.
 */
export function Sidebar({collapsed, onToggleCollapse, project, }: Props) {

    return (
      <div id="sidebar" className={collapsed ? "sidebar sidebar--collapsed" : "sidebar sidebar--expanded"}>

        {/*Boton para expandir o reducir el sidebar*/
}
        <button className="sidebar__toggle-btn" onClick={onToggleCollapse}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" className="sidebar__toggle-icon" id="sidebarToggleIcon">
            {collapsed ? (
            // Flecha hacia la derecha
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            ) : (
            // Flecha hacia la izquierda
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            )}
          </svg>
        </button>

        {/*Header del sidebar*/
}
        <div className="sidebar__header">
          <span className="sidebar__brand">PMO</span>
          <span className="sidebar__title sidebar__text">Aperturas</span>
        </div>

        <nav className="sidebar__nav">
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}` }>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="sidebar__nav-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.414-.414 1.087-.414 1.501 0l8.955 8.955c.16.16.242.378.242.597v8.948c0 .414-.336.75-.75.75h-8.955c-.16 0-.319-.064-.434-.179l-8.955-8.955c-.16-.16-.242-.378-.242-.597v-8.948c0-.414.336-.75.75-.75z"></path>
            </svg>
            <span className="sidebar__nav-label sidebar__text">Dashboard</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}` }>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 416 432">
              <path fill="#ffffff" d="m366 237l45 35q7 6 3 14l-43 74q-4 8-13 4l-53-21q-18 13-36 21l-8 56q-1 9-11 9h-85q-9 0-11-9l-8-56q-19-8-36-21l-53 21q-9 3-13-4L1 286q-4-8 3-14l45-35q-1-12-1-21t1-21L4 160q-7-6-3-14l43-74q5-8 13-4l53 21q18-13 36-21l8-56q2-9 11-9h85q10 0 11 9l8 56q19 8 36 21l53-21q9-3 13 4l43 74q4 8-3 14l-45 35q2 12 2 21t-2 21zm-158.5 54q30.5 0 52.5-22t22-53t-22-53t-52.5-22t-52.5 22t-22 53t22 53t52.5 22z"/>
            </svg>
            <span className="sidebar__nav-label sidebar__text">Configuracion</span>
          </NavLink>

          <hr className="sidebar__divider"/>

          <div id="activeProjectDisplay" className="sidebar__project sidebar__text">Proyecto: {project?.Title ?? "No hay seleccionado"}</div> 
          
          {project ?
            <div className="sidebar__primary-actions">
              <NavLink to={`/kanban/${project.Id}`} className={({ isActive }) => `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}` }>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="sidebar__nav-icon">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
                </svg>
                <span className="sidebar__nav-label sidebar__text">Fases</span>
              </NavLink> 

              <NavLink to={`/gantt/${project.Id}`} className={({ isActive }) => `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}` }>
                <svg xmlns="http://www.w3.org/2000/svg" className="sidebar__nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="sidebar__nav-label sidebar__text">Cronograma</span>
              </NavLink> 

              <NavLink to={`/resource/${project.Id}`} className={({ isActive }) => `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}` }>
                <svg xmlns="http://www.w3.org/2000/svg" className="sidebar__nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="sidebar__nav-label sidebar__text">Asignación Recursos</span>
              </NavLink>
          
            </div> : null
          }
      </nav>

      <div className="sidebar__footer sidebar__text">
        Project Manager EDM.
      </div>
    </div>

  );
}

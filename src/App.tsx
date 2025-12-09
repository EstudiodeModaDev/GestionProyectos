import * as React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./auth/authProvider";
import { GraphServicesProvider } from "./graph/graphContext";
import Welcome from "./Components/Landing/Welcome";
import { Dashboard } from "./Components/Dashboard/Dashboard";
import Desviation from "./Components/Desviacion/Desviacion";
import type{ ProjectSP } from "./models/Projects";
import KanbanApertura, { type KanbanPhase } from "./Components/kanban/Kanban";

type View = "dashboard" | "kanban" | "gantt" | "resource" | "analysis"

const fasesAperturaTienda: KanbanPhase[] = [
  {id: 1, name: "Planificación y concepto"},
  {id: 2, name: "Diseño y construcción"},
  {id: 3, name: "Adquisiciones y Contratación"},
  {id: 4, name: "Pre-Apertura y Marketing"},
  {id: 5, name: "Apertura y Cierre"},
]

/* ============================================================
   Shell: controla autenticación básica y muestra LoggedApp
   ============================================================ */
function Shell() {
  const { ready, account, signIn, signOut } = useAuth();
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const isLogged = Boolean(account);

  const handleAuthClick = async () => {
    if (!ready || loadingAuth) return;
    setLoadingAuth(true);
    try {
      if (isLogged) await signOut();
      else await signIn("popup");
    } finally {
      setLoadingAuth(false);
    }
  };

  if (!ready || !isLogged) {
    return (
      <div className="page layout">
        <section className="page-view">
          <Welcome onLogin={handleAuthClick} />
        </section>
      </div>
    );
  }

  return <LoggedApp/>;
}

/* ============================================================
   Sidebar
   ============================================================ */
function Sidebar({ onChangeView, collapsed, onToggleCollapse }: { activeView: View, onChangeView: (view: View) => void, collapsed: boolean, onToggleCollapse: () => void }) {

    return (
      <div id="sidebar" className={collapsed ? "sidebar sidebar--collapsed" : "sidebar sidebar--expanded"}>

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

        <div className="sidebar__header">
          <span className="sidebar__brand">PMO</span>
          <span className="sidebar__title sidebar__text">Aperturas</span>
        </div>

        <nav className="sidebar__nav">
          <a id="nav-dashboard" className="sidebar__nav-item sidebar__nav-item--active" onClick={() => onChangeView("dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="sidebar__nav-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.414-.414 1.087-.414 1.501 0l8.955 8.955c.16.16.242.378.242.597v8.948c0 .414-.336.75-.75.75h-8.955c-.16 0-.319-.064-.434-.179l-8.955-8.955c-.16-.16-.242-.378-.242-.597v-8.948c0-.414.336-.75.75-.75z"></path>
            </svg>
            <span className="sidebar__nav-label sidebar__text">Dashboard</span>
          </a>

          <hr className="sidebar__divider"/>

          <div id="activeProjectDisplay" className="sidebar__project sidebar__text">Proyecto: Medellín</div> {/*TODO: Hacer que el proyecto cambie segun el proyecto activo*/}

          <a id="nav-kanban" className="sidebar__nav-item" onClick={() => onChangeView("kanban")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="sidebar__nav-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"></path>
            </svg>
            <span className="sidebar__nav-label sidebar__text">Fases</span>
          </a>

          <div className="sidebar__primary-actions">
            <button id="nav-gantt" className="sidebar__primary-btn" onClick={() => onChangeView("gantt")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="sidebar__nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="sidebar__nav-label sidebar__text">Cronograma</span>
            </button>

            <button id="nav-resource" className="sidebar__primary-btn" onClick={() => onChangeView("resource")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="sidebar__nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="sidebar__nav-label sidebar__text">Asignación Recursos</span>
            </button>
        </div>
      </nav>

      <div className="sidebar__footer sidebar__text">
        Mockup V2.0 (Diseño EDM.)
      </div>
    </div>

  );
}

/* ============================================================
   LoggedApp: sidebar + header + contenido
   ============================================================ */

function LoggedApp() {
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false)
  const [activeView, setActiveView] = React.useState<View>("dashboard")
  const [selectedProject, setSelectedProject] = React.useState<ProjectSP | null>(null)

  return (
    <div className={`gd-layout is-collapsed`}>
      <Sidebar activeView={activeView} onChangeView={setActiveView} collapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(prev =>!prev)}/>
      <main className="gd-main">        
        <section className="gd-content">
          {activeView === "dashboard" ? <Dashboard onOpenProjectKanban={(project:ProjectSP) => {setSelectedProject(project); setActiveView("kanban");}} onShowPostClosureAnalysis={(project:ProjectSP) => {setSelectedProject(project); setActiveView("analysis");}}/> : 
          activeView === "analysis" ? <Desviation project={selectedProject!} onBack={() => setActiveView("dashboard")}/> : 
          activeView === "kanban" ? <KanbanApertura project={selectedProject!} fases={fasesAperturaTienda}></KanbanApertura> : null}
        </section>
      </main>
    </div>
  );
}

/* ============================================================
   App root y gate de servicios
   ============================================================ */

export default function App() {
  return (
    <AuthProvider>
      <GraphServicesGate>
        <Shell />
      </GraphServicesGate>
    </AuthProvider>
  );
}

function GraphServicesGate({ children }: { children: React.ReactNode }) {
  const { ready, account } = useAuth();
  if (!ready || !account) return <>{children}</>;
  return <GraphServicesProvider>{children}</GraphServicesProvider>;
}

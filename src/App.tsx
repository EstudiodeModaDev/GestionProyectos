import * as React from "react";
import "./App.css";
import { AuthProvider, useAuth } from "./auth/authProvider";
import { GraphServicesProvider } from "./graph/graphContext";
import Welcome from "./Components/Landing/Welcome";
import { Sidebar } from "./Components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./routes";
import type { ProjectSP } from "./models/Projects";

/**
 * Vistas principales disponibles dentro de la aplicacion autenticada.
 *
 * Este tipo se usa para representar las secciones funcionales que el usuario
 * puede consultar desde la navegacion principal
 */
export type View = "dashboard" | "kanban" | "gantt" | "resource" | "analysis" | "settings"

/**
 * Controla la entrada principal de la aplicacion segun el estado de autenticacion.
 *
 * Este componente consulta el contexto de autenticacion para saber si la
 * aplicacion ya termino de inicializarse, si existe una cuenta activa y cual
 * debe ser la accion del boton de acceso. Mientras el usuario no haya iniciado
 * sesion, muestra la pantalla de bienvenida con la accion de login. Cuando la
 * sesion esta disponible, delega la interfaz completa a {@link LoggedApp}.
 *
 * Tambien protege el flujo de autenticacion con un estado local para evitar
 * que se disparen varios inicios o cierres de sesion al mismo tiempo.
 *
 * @returns La pantalla de bienvenida o la aplicacion autenticada segun el
 * estado actual de la sesion.
 */
export function Shell() {
  const { ready, account, signIn, signOut } = useAuth();
  const [loadingAuth, setLoadingAuth] = React.useState(false);
  const isLogged = Boolean(account);

  /**
   * Ejecuta la accion de autenticacion correspondiente al estado actual.
   *
   * Si la aplicacion aun no termino de inicializar la autenticacion o si ya hay
   * una operacion en curso, la funcion termina sin hacer nada. En caso
   * contrario, abre el flujo de inicio de sesion en modo popup cuando no hay un
   * usuario autenticado, o cierra la sesion activa cuando ya existe una cuenta.
   *
   * El estado `loadingAuth` se usa como candado para evitar dobles clics y se
   * restablece incluso si la operacion falla.
   *
   * @returns Una promesa que se resuelve cuando finaliza el login o logout.
   */
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

/**
 * Renderiza la experiencia principal para usuarios autenticados.
 *
 * Este componente mantiene el estado visual del layout protegido, como el
 * colapso del sidebar y el proyecto actualmente seleccionado. Ademas, observa
 * la ruta actual para redirigir automaticamente desde `/` hacia
 * `/dashboard`, garantizando que la aplicacion siempre cargue una vista valida.
 *
 * La seleccion del proyecto se comparte entre el sidebar y el arbol de rutas
 * para que ambas zonas trabajen sobre el mismo contexto funcional.
 *
 * @returns El contenedor principal con sidebar, area de contenido y rutas
 * internas de la aplicacion.
 */
export function LoggedApp() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [selectedProject, setSelectedProject ] = React.useState<null | ProjectSP>(null)

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Redirige la ruta raiz hacia el dashboard.
   *
   * Este efecto evita que un usuario autenticado quede en una ruta vacia y
   * fuerza una vista inicial consistente cuando entra a la aplicacion.
   */
  React.useEffect(() => {
    if (location.pathname === "/" || location.pathname==="/home") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="gd-layout is-collapsed">
      <Sidebar collapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed((prev) => !prev)} project={selectedProject} />

      <main className="gd-main">
        <section className="gd-content">
          <AppRoutes setSelectedProject={setSelectedProject} project={selectedProject}/>
        </section>
      </main>
    </div>
  );
}

/**
 * Compone la raiz de la aplicacion y registra los proveedores globales.
 *
 * Primero envuelve toda la aplicacion con {@link AuthProvider} para que el
 * estado de autenticacion este disponible en cualquier componente. Luego usa
 * {@link GraphServicesGate} para habilitar los servicios de Microsoft Graph
 * solo cuando la sesion del usuario ya esta lista.
 *
 * @returns El arbol base de providers junto con el componente {@link Shell}.
 */
export default function App() {
  return (
    <AuthProvider>
      <GraphServicesGate>
        <Shell />
      </GraphServicesGate>
    </AuthProvider>
  );
}

/**
 * Activa el proveedor de servicios de Graph solo cuando existe una sesion valida.
 *
 * Este componente funciona como una compuerta condicional para evitar montar
 * {@link GraphServicesProvider} antes de que el contexto de autenticacion tenga
 * un usuario disponible. Si la autenticacion aun no esta lista o no hay cuenta
 * activa, simplemente renderiza a sus hijos sin envolverlos.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido que se renderiza dentro o fuera del proveedor
 * de Graph segun el estado de autenticacion.
 * @returns Los hijos envueltos por el proveedor de Graph cuando existe una
 * sesion activa, o los mismos hijos sin proveedor en caso contrario.
 */
export function GraphServicesGate({ children }: { children: React.ReactNode }) {
  const { ready, account } = useAuth();
  if (!ready || !account) return <>{children}</>;
  return <GraphServicesProvider>{children}</GraphServicesProvider>;
}

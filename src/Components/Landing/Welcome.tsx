// src/LandingPage.tsx
import "./Welcome.css";

export type LandingPage = {
  onLogin: () => void;                  
  productName?: string;                
  footer?: React.ReactNode;             
};


const LandingPage: React.FC<LandingPage> = ({onLogin}) => {
  return (
    <div className="lp-root">
      {/* Header */}
      <header className="lp-header">
        <div className="lp-logo">
          <h1>Gestión de proyectos</h1>
        </div>
      </header>

      {/* Hero */}
      <main className="lp-main">
        <section className="lp-hero">
          <div className="lp-hero-left">

            <h1 className="lp-title">
              Organiza tus proyectos,
              <br />
              <span className="lp-title-highlight">sin perder el control.</span>
            </h1>

            <p className="lp-subtitle">
              Centraliza tareas, fechas y responsables en un solo lugar.
            </p>

            <ul className="lp-bullets">
              <li>Visibilidad clara de cada proyecto y su estado.</li>
              <li>Timeline de actividades y entregables clave.</li>
              <li>Asignación de responsables y seguimiento simple.</li>
            </ul>

            <p className="lp-note">Para ingresar solo debes usar tus credenciales corporativas</p>
          </div>

          <div className="lp-hero-rigt">

            <a className="btn btn-primary-final btn-xs btn-block" onClick={() => onLogin()}>Ingresar</a>

          </div>


        </section>

        {/* Features */}
        <section id="features" className="lp-section">
          <h2 className="lp-section-title">Todo lo que necesitas en un solo lugar</h2>
          <p className="lp-section-subtitle">
            Diseñada para equipos que quieren tener claridad, foco y resultados.
          </p>

          <div className="lp-features-grid">
            <article className="lp-feature-card">
              <h3>Proyectos claros</h3>
              <p>
                Define objetivos, hitos y entregables sin complicarte. Cada
                proyecto tiene su propia línea de tiempo y responsables.
              </p>
            </article>

            <article className="lp-feature-card">
              <h3>Tareas accionables</h3>
              <p>
                Convierte ideas en tareas concretas con fechas, prioridad y
                comentarios. Nunca más “¿en qué iba esto?”.
              </p>
            </article>

            <article className="lp-feature-card">
              <h3>Vista general</h3>
              <p>
                Un panel para ver qué está en riesgo, qué va en tiempo y qué
                ya se entregó, sin buscar en mil lugares.
              </p>
            </article>
          </div>
        </section>

      </main>

      <footer className="lp-footer">
        <span>© {new Date().getFullYear()} Tu app de proyectos</span>
      </footer>
    </div>
  );
};

export default LandingPage;

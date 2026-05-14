import * as React from "react";
import type { marcas, zonas } from "../../../models/generalConfigs";
import type { jefeZona } from "../../../models/responsables";
import "../TasksSettings/TaskSettings.css";
import "./GeneralSettings.css";

type JefeZonaForm = {
  marcaId: string;
  zonaId: string;
  jefeNombre: string;
  jefeCorreo: string;
};

type Props = {
  open: boolean;
  items: jefeZona[];
  marcas: marcas[];
  zonas: zonas[];
  loading?: boolean;
  saving?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (form: JefeZonaForm) => void | Promise<void>;
  onUpdate: (id: string, form: JefeZonaForm) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
};

const EMPTY_FORM: JefeZonaForm = {
  marcaId: "",
  zonaId: "",
  jefeNombre: "",
  jefeCorreo: "",
};

function toForm(item: jefeZona): JefeZonaForm {
  return {
    marcaId: item.id_marca ?? "",
    zonaId: item.id_zona ?? "",
    jefeNombre: item.jefe_nombre ?? "",
    jefeCorreo: item.jefe_correo ?? "",
  };
}

function getMarcaLabel(id: string, items: marcas[]) {
  return items.find((item) => Number(item.id ?? 0) === Number(id))?.nombre_marca ?? `Marca ${id}`;
}

function getZonaLabel(id: string, items: zonas[]) {
  return items.find((item) => Number(item.id ?? 0) === Number(id))?.zonas ?? `Zona ${id}`;
}

export function JefesZonaConfigModal({
  open,
  items,
  marcas,
  zonas,
  loading = false,
  saving = false,
  error = null,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [draft, setDraft] = React.useState<JefeZonaForm>(EMPTY_FORM);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [marcaFilter, setMarcaFilter] = React.useState("");
  const [zonaFilter, setZonaFilter] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setDraft(EMPTY_FORM);
      setEditingId(null);
      setMarcaFilter("");
      setZonaFilter("");
    }
  }, [open]);

  if (!open) return null;

  const filteredItems = items.filter((item) => {
    const matchesMarca = !marcaFilter || String(item.id_marca ?? "") === marcaFilter;
    const matchesZona = !zonaFilter || String(item.id_zona ?? "") === zonaFilter;
    return matchesMarca && matchesZona;
  });

  const handleChange = <K extends keyof JefeZonaForm>(key: K, value: JefeZonaForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const resetDraft = () => {
    setDraft(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.marcaId || !draft.zonaId || !draft.jefeNombre.trim() || !draft.jefeCorreo.trim()) return;

    if (editingId) await onUpdate(editingId, draft);
    else await onCreate(draft);

    resetDraft();
  };

  const handleEdit = (item: jefeZona) => {
    setEditingId(item.id ?? null);
    setDraft(toForm(item));
  };

  return (
    <>
      <div className="tp-modal-backdrop tp-modal-backdrop--nested" onClick={onClose} />
      <section className="tp-detail-modal" role="dialog" aria-modal="true" aria-labelledby="jefes-zona-config-title">
        <div className="tp-detail-modal__panel general-config-modal general-config-modal--wide">
          <header className="tp-detail-modal__header">
            <div>
              <h2 id="jefes-zona-config-title" className="tp-detail-modal__title">
                Configurar jefes de zona
              </h2>
              <p className="tp-detail-modal__subtitle">
                Define que responsable se resolvera para cada combinacion de marca y zona.
              </p>
            </div>

            <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">
              x
            </button>
          </header>

          <div className="general-config-modal__body general-config-modal__body--wide">
            <form className="general-config-form" onSubmit={handleSubmit}>
              <label className="tp-field">
                <span className="tp-field__label">Marca</span>
                <select className="tp-field__input" value={draft.marcaId} onChange={(event) => handleChange("marcaId", event.target.value)} required>
                  <option value="">Selecciona una marca</option>
                  {marcas.map((marca) => (
                    <option key={marca.id ?? marca.nombre_marca} value={String(marca.id ?? "")}>
                      {marca.nombre_marca}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Zona</span>
                <select className="tp-field__input" value={draft.zonaId} onChange={(event) => handleChange("zonaId", event.target.value)} required>
                  <option value="">Selecciona una zona</option>
                  {zonas.map((zona) => (
                    <option key={zona.id ?? zona.zonas} value={String(zona.id ?? "")}>
                      {zona.zonas}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Nombre del jefe</span>
                <input
                  className="tp-field__input"
                  value={draft.jefeNombre}
                  onChange={(event) => handleChange("jefeNombre", event.target.value)}
                  placeholder="Escribe el nombre del jefe"
                  required
                />
              </label>

              <label className="tp-field">
                <span className="tp-field__label">Correo</span>
                <input
                  className="tp-field__input"
                  type="email"
                  value={draft.jefeCorreo}
                  onChange={(event) => handleChange("jefeCorreo", event.target.value)}
                  placeholder="correo@empresa.com"
                  required
                />
              </label>

              <div className="general-config-form__actions">
                <button type="submit" className="tp-btn tp-btn--primary" disabled={saving}>
                  {editingId ? "Guardar cambios" : "Agregar"}
                </button>

                {editingId ? (
                  <button type="button" className="tp-btn tp-btn--ghost" onClick={resetDraft} disabled={saving}>
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </form>

            <div className="general-config-list">
              <section className="general-config-filters" aria-label="Filtros del listado">
                <div className="general-config-filters__header">
                  <div>
                    <strong>Filtrar configuraciones</strong>
                    <p>
                      {filteredItems.length} de {items.length} registro{items.length === 1 ? "" : "s"} visible
                      {filteredItems.length === 1 ? "" : "s"}.
                    </p>
                  </div>

                  {(marcaFilter || zonaFilter) ? (
                    <button type="button" className="tp-btn tp-btn--ghost tp-btn--xs" onClick={() => {
                      setMarcaFilter("");
                      setZonaFilter("");
                    }}>
                      Limpiar filtros
                    </button>
                  ) : null}
                </div>

                <div className="general-config-filters__grid">
                  <label className="tp-field">
                    <span className="tp-field__label">Filtrar por marca</span>
                    <select className="tp-field__input" value={marcaFilter} onChange={(event) => setMarcaFilter(event.target.value)}>
                      <option value="">Todas las marcas</option>
                      {marcas.map((marca) => (
                        <option key={marca.id ?? marca.nombre_marca} value={String(marca.id ?? "")}>
                          {marca.nombre_marca}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="tp-field">
                    <span className="tp-field__label">Filtrar por zona</span>
                    <select className="tp-field__input" value={zonaFilter} onChange={(event) => setZonaFilter(event.target.value)}>
                      <option value="">Todas las zonas</option>
                      {zonas.map((zona) => (
                        <option key={zona.id ?? zona.zonas} value={String(zona.id ?? "")}>
                          {zona.zonas}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              {loading ? (
                <div className="general-config-empty">
                  <p>Cargando configuraciones...</p>
                </div>
              ) : null}
              {error ? (
                <div className="general-config-empty">
                  <p>{error}</p>
                </div>
              ) : null}
              {!loading && items.length === 0 ? (
                <div className="general-config-empty">
                  <p>No hay jefes de zona configurados todavia.</p>
                </div>
              ) : null}
              {!loading && items.length > 0 && filteredItems.length === 0 ? (
                <div className="general-config-empty">
                  <p>No hay configuraciones que coincidan con los filtros seleccionados.</p>
                </div>
              ) : null}

              {filteredItems.map((item) => (
                <article key={item.id ?? `${item.id_marca}-${item.id_zona}-${item.jefe_nombre}`} className="general-config-item general-config-item--stacked">
                  <div className="general-config-item__copy">
                    <strong>{item.jefe_nombre}</strong>
                    <span>{item.jefe_correo}</span>
                  </div>

                  <div className="general-config-badges">
                    <span className="general-config-badge">{getMarcaLabel(item.id_marca, marcas)}</span>
                    <span className="general-config-badge">{getZonaLabel(item.id_zona, zonas)}</span>
                  </div>

                  <div className="general-config-item__actions">
                    <button type="button" className="tp-btn tp-btn--ghost tp-btn--xs" onClick={() => handleEdit(item)} disabled={saving}>
                      Editar
                    </button>
                    {item.id ? (
                      <button type="button" className="tp-btn tp-btn--ghost tp-btn--xs" onClick={() => onDelete(item.id!)} disabled={saving}>
                        Eliminar
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

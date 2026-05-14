import * as React from "react";
import "../TasksSettings/TaskSettings.css";
import "./GeneralSettings.css";

type SingleFieldItem = {
  id?: number;
  isActive?: boolean;
};

type Props<T extends SingleFieldItem> = {
  open: boolean;
  title: string;
  description: string;
  fieldLabel: string;
  fieldKey: keyof T;
  items: T[];
  onClose: () => void;
  onCreate: (value: string) => void | Promise<void>;
  onUpdate?: (id: number | undefined, value: string) => void | Promise<void>;
  onToggleActive?: (id: number | undefined, nextValue: boolean) => void;
  
};

function getDisplayValue<T extends SingleFieldItem>(item: T, key: keyof T): string {
  const value = item[key];
  return typeof value === "string" ? value : "";
}

export function SingleFieldConfigModal<T extends SingleFieldItem>({
  open,
  title,
  description,
  fieldLabel,
  fieldKey,
  items,
  onClose,
  onCreate,
  onUpdate,
  onToggleActive,
}: Props<T>) {
  const [draft, setDraft] = React.useState("");
  const [editingId, setEditingId] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (!open) {
      setDraft("");
      setEditingId(undefined);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;

    if (editingId !== undefined && onUpdate) {
      onUpdate(editingId, value);
    } else {
      onCreate(value);
    }

    setDraft("");
    setEditingId(undefined);
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    setDraft(getDisplayValue(item, fieldKey));
  };

  return (
    <>
      <div className="tp-modal-backdrop tp-modal-backdrop--nested" onClick={onClose} />
      <section className="tp-detail-modal" role="dialog" aria-modal="true" aria-labelledby="general-config-title">
        <div className="tp-detail-modal__panel general-config-modal">
          <header className="tp-detail-modal__header">
            <div>
              <h2 id="general-config-title" className="tp-detail-modal__title">
                {title}
              </h2>
              <p className="tp-detail-modal__subtitle">{description}</p>
            </div>

            <button type="button" className="tp-modal__close-btn" onClick={onClose} aria-label="Cerrar">
              x
            </button>
          </header>

          <div className="general-config-modal__body">
            <form className="general-config-form" onSubmit={handleSubmit}>
              <label className="tp-field">
                <span className="tp-field__label">{fieldLabel}</span>
                <input
                  className="tp-field__input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Escribe ${fieldLabel.toLowerCase()}`}
                  required
                />
              </label>

              <div className="general-config-form__actions">
                <button type="submit" className="tp-btn tp-btn--primary">
                  {editingId !== undefined ? "Guardar cambios" : "Agregar"}
                </button>

                {editingId !== undefined ? (
                  <button
                    type="button"
                    className="tp-btn tp-btn--ghost"
                    onClick={() => {
                      setEditingId(undefined);
                      setDraft("");
                    }}
                  >
                    Cancelar edicion
                  </button>
                ) : null}
              </div>
            </form>

            <div className="general-config-list">
              {items.length === 0 ? (
                <div className="general-config-empty">
                  <p>No hay elementos configurados todavia.</p>
                </div>
              ) : (
                items.map((item) => {
                  const value = getDisplayValue(item, fieldKey);
                  const isActive = item.isActive ?? true;

                  return (
                    <article key={`${title}-${item.id ?? value}`} className="general-config-item">
                      <div className="general-config-item__copy">
                        <strong>{value}</strong>
                        <span>{isActive ? "Activo" : "Inactivo"}</span>
                      </div>

                      <div className="general-config-item__actions">
                        {onUpdate ? (
                          <button type="button" className="tp-btn tp-btn--ghost tp-btn--xs" onClick={() => handleEdit(item)}>
                            Editar
                          </button>
                        ) : null}

                        {onToggleActive ? (
                          <button
                            type="button"
                            className="tp-btn tp-btn--ghost tp-btn--xs"
                            onClick={() => onToggleActive(item.id, !isActive)}
                          >
                            {isActive ? "Desactivar" : "Activar"}
                          </button>
                        ) : null}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

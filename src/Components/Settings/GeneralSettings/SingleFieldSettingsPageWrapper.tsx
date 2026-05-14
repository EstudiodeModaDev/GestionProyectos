import * as React from "react";
import { useNavigate } from "react-router-dom";
import "./GeneralSettings.css";
import { SingleFieldConfigModal } from "./SingleFieldConfigModal";

type SingleFieldItem = {
  id?: number;
  isActive?: boolean;
};

type Props<T extends SingleFieldItem> = {
  title: string;
  description: string;
  fieldLabel: string;
  fieldKey: keyof T;
  items: T[];
  loading?: boolean;
  error?: string | null;
  backTo?: string;
  backLabel?: string;
  onCreate: (value: string) => void | Promise<void>;
  onUpdate?: (id: number | undefined, value: string) => void | Promise<void>;
  onToggleActive?: (id: number | undefined, nextValue: boolean) => void;
};

export function SingleFieldSettingsPageWrapper<T extends SingleFieldItem>({
  title,
  description,
  fieldLabel,
  fieldKey,
  items,
  loading = false,
  error = null,
  backTo,
  backLabel = "Volver a configuraciones",
  onCreate,
  onUpdate,
  onToggleActive,
}: Props<T>) {
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);

  return (
    <section className="general-settings-page">
      <header className="general-settings-page__header">
        {backTo ? (
          <button className="pl-btn pl-btn--ghost general-settings-page__back-btn" type="button" onClick={() => navigate(backTo)}>
            {backLabel}
          </button>
        ) : null}
        <span className="general-settings-page__eyebrow">Settings</span>
        <h1 className="general-settings-page__title">{title}</h1>
        <p className="general-settings-page__text">{description}</p>
      </header>

      <div className="general-settings-grid">
        <article className="general-settings-card">
          <div className="general-settings-card__topline" />
          <div>
            <h2 className="general-settings-card__title">{title}</h2>
            <p className="general-settings-card__text">{description}</p>
          </div>

          <div className="general-settings-card__meta">
            <span className="general-settings-card__meta-label">Registros activos</span>
            <strong>{items.length}</strong>
          </div>

          {loading ? <p className="general-settings-card__text">Cargando registros...</p> : null}
          {error ? <p className="general-settings-card__text">{error}</p> : null}

          <button className="pl-btn pl-btn--primary" type="button" onClick={() => setOpen(true)}>
            Abrir configuracion
          </button>
        </article>
      </div>

      <SingleFieldConfigModal<T>
        open={open}
        title={title}
        description={description}
        fieldLabel={fieldLabel}
        fieldKey={fieldKey}
        items={items}
        onClose={() => setOpen(false)}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onToggleActive={onToggleActive}
      />
    </section>
  );
}

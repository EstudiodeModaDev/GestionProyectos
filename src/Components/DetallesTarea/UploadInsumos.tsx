import React from "react";

type SalidaItem = {
  id: string;
  title: string;
  tipo: string;
  texto?: string;
  estado?: "Subido" | "Pendiente";
  fileName?: string;
  options?: string[];
};

type SalidaValue =
  | { kind: "Archivo"; file: File | null }
  | { kind: "Texto"; text: string }
  | { kind: "Opcion"; approved: string }
  | { kind: "Fecha"; date: string };

export type SalidaValues = Record<string, SalidaValue>;

type SalidaModalProps = {
  open: boolean;
  salidas: SalidaItem[];
  onClose: () => void;
  onSubmit: (values: SalidaValues) => Promise<boolean | void> | boolean | void;
  submitting?: boolean;
};

const hasExistingValue = (item: SalidaItem): boolean => {
  if (item.estado !== "Subido") return false;
  if (item.tipo === "Archivo") return Boolean(item.fileName || item.texto);
  return Boolean(item.texto?.trim());
};

const initialValueFor = (item: SalidaItem): SalidaValue => {
  if (item.tipo === "Archivo") return { kind: "Archivo", file: null };
  if (item.tipo === "Texto") return { kind: "Texto", text: item.texto ?? "" };
  if (item.tipo === "Fecha") return { kind: "Fecha", date: item.texto ?? "" };
  return { kind: "Opcion", approved: item.texto ?? "" };
};

export const SalidaModal: React.FC<SalidaModalProps> = ({ open, salidas, onClose, onSubmit }) => {
  const [values, setValues] = React.useState<SalidaValues>({});
  const [editableIds, setEditableIds] = React.useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!open) return;

    setValues(() => {
      const next: SalidaValues = {};
      for (const salida of salidas) {
        next[salida.id] = initialValueFor(salida);
      }
      return next;
    });

    setEditableIds(() => {
      const next: Record<string, boolean> = {};
      for (const salida of salidas) {
        next[salida.id] = !hasExistingValue(salida);
      }
      return next;
    });
  }, [open, salidas]);

  if (!open) return null;

  const setFile = (id: string, file: File | null) => {
    setValues((s) => ({ ...s, [id]: { kind: "Archivo", file } }));
  };

  const setText = (id: string, text: string) => {
    setValues((s) => ({ ...s, [id]: { kind: "Texto", text } }));
  };

  const setApproved = (id: string, approved: string) => {
    setValues((s) => ({ ...s, [id]: { kind: "Opcion", approved } }));
  };

  const setDate = (id: string, date: string) => {
    setValues((s) => ({ ...s, [id]: { kind: "Fecha", date } }));
  };

  const enableEdit = (id: string) => {
    setEditableIds((s) => ({ ...s, [id]: true }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const shouldClose = await onSubmit(values);
    if (shouldClose !== false) {
      onClose();
    }
    setSubmitting(false);
  };

  const renderChangeButton = (id: string) => (
    <button type="button" className="salidas-change-btn" onClick={() => enableEdit(id)} disabled={submitting}>
      Cambiar
    </button>
  );

  const renderControl = (s: SalidaItem) => {
    const value = values[s.id];
    const alreadyUploaded = hasExistingValue(s);
    const isEditable = editableIds[s.id] ?? !alreadyUploaded;

    if (s.tipo === "Archivo") {
      const fileVal = value?.kind === "Archivo" ? value.file : null;
      return (
        <div className="salidas-control-stack">
          {alreadyUploaded ? (
            <div className="salidas-current">
              <div className="salidas-current-copy">
                <span className="salidas-current-label">Archivo actual</span>
                <strong className="salidas-current-value">{s.fileName || s.texto || "Ya cargado"}</strong>
              </div>
              {!isEditable ? renderChangeButton(s.id) : null}
            </div>
          ) : null}
          {!alreadyUploaded || isEditable ? (
            <input
              type="file"
              className="field__input"
              onChange={(e) => setFile(s.id, e.target.files?.[0] ?? null)}
              disabled={submitting}
            />
          ) : null}
          {fileVal?.name ? (
            <small className="salidas-hint salidas-hint-strong">
              {alreadyUploaded ? "Nuevo archivo para resubir" : "Seleccionado"}: {fileVal.name}
            </small>
          ) : null}
        </div>
      );
    }

    if (s.tipo === "Texto") {
      const textVal = value?.kind === "Texto" ? value.text : "";
      return (
        <div className="salidas-control-stack">
          {alreadyUploaded ? (
            <div className="salidas-current">
              <div className="salidas-current-copy">
                <span className="salidas-current-label">Valor actual</span>
                <strong className="salidas-current-value">{s.texto || "Sin contenido"}</strong>
              </div>
              {!isEditable ? renderChangeButton(s.id) : null}
            </div>
          ) : null}
          <textarea
            className={`rrm-textarea ${!isEditable ? "salidas-control-disabled" : ""}`}
            rows={2}
            placeholder="Escribe aqui..."
            value={textVal}
            onChange={(e) => setText(s.id, e.target.value)}
            disabled={submitting || !isEditable}
          />
        </div>
      );
    }

    if (s.tipo === "Fecha") {
      const dateVal = value?.kind === "Fecha" ? value.date : "";
      return (
        <div className="salidas-control-stack">
          {alreadyUploaded ? (
            <div className="salidas-current">
              <div className="salidas-current-copy">
                <span className="salidas-current-label">Valor actual</span>
                <strong className="salidas-current-value">{s.texto || "Sin fecha"}</strong>
              </div>
              {!isEditable ? renderChangeButton(s.id) : null}
            </div>
          ) : null}
          <input
            type="date"
            className={`field__input ${!isEditable ? "salidas-control-disabled" : ""}`}
            value={dateVal}
            onChange={(e) => setDate(s.id, e.target.value)}
            disabled={submitting || !isEditable}
          />
        </div>
      );
    }

    const approvedVal = value?.kind === "Opcion" ? value.approved : "";
    return (
      <div className="salidas-control-stack">
        {alreadyUploaded ? (
          <div className="salidas-current">
            <div className="salidas-current-copy">
              <span className="salidas-current-label">Valor actual</span>
              <strong className="salidas-current-value">{s.texto || "Sin seleccionar"}</strong>
            </div>
            {!isEditable ? renderChangeButton(s.id) : null}
          </div>
        ) : null}
        <select
          name="opcional"
          value={approvedVal}
          onChange={(e) => setApproved(s.id, e.target.value)}
          className={`field__input ${!isEditable ? "salidas-control-disabled" : ""}`}
          disabled={submitting || !isEditable}
        >
          <option value="">Selecciona una opcion</option>
          {(s.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="modal">
      <div className="modal__backdrop"/>

      <div className="modal__panel" role="dialog" aria-modal="true">
        <h2 className="modal__title">Completar entregables</h2>
        <p className="modal__text">Antes de finalizar debes completar lo siguiente.</p>

        <ul className="salidas-list">
          {salidas.map((s) => (
            <li key={s.id} className="salidas-item">
              <div className="salidas-head">
                <strong className="salidas-title">{s.title}</strong>
              </div>

              <div className="salidas-control">{renderControl(s)}</div>
            </li>
          ))}
        </ul>

        <div className="modal__footer">
          <button type="button" className="btn modal__btn-cancel" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>

          <button type="button" className="btn btn--primary modal__btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Guardando..." : "Guardar entregables"}
          </button>
        </div>
      </div>
    </div>
  );
};

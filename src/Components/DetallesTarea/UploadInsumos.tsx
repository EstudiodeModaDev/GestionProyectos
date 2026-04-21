import React from "react";

type SalidaItem = {
  id: string;
  title: string;
  tipo: string;
  texto?: string;
};

type SalidaValue =| { kind: "Archivo"; file: File | null } | { kind: "Texto"; text: string } | { kind: "Opcion"; approved: string };

export type SalidaValues = Record<string, SalidaValue>;

type SalidaModalProps = {
  open: boolean;
  salidas: SalidaItem[];
  onClose: () => void;
  onSubmit: (values: SalidaValues) => void;
  submitting?: boolean; // opcional: para deshabilitar botones mientras guardas
};

/**
 * Crea el valor inicial para un entregable segun su tipo de captura.
 *
 * @param tipo - Tipo de insumo configurado.
 * @returns Estructura inicial compatible con el formulario del modal.
 */
const defaultValueFor = (tipo: string): SalidaValue => {
  if (tipo === "Archivo") return { kind: "Archivo", file: null };
  if (tipo === "Texto") return { kind: "Texto", text: "" };
  return { kind: "Opcion", approved: "" };
};

/**
 * Solicita al usuario los entregables requeridos antes de cerrar una tarea.
 *
 * @param props - Propiedades del modal de salidas.
 * @returns Modal con controles dinamicos para archivos, texto u opciones.
 */
export const SalidaModal: React.FC<SalidaModalProps> = ({open, salidas, onClose, onSubmit,}) => {
  const [values, setValues] = React.useState<SalidaValues>({});
  const [submitting, setSubmiting] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (!open) return;

    setValues((prev) => {
      const next: SalidaValues = { ...prev };
      for (const s of salidas) {
        if (!next[s.id]) next[s.id] = defaultValueFor(s.tipo);
      }
      // Si quieres limpiar los que ya no existen:
      Object.keys(next).forEach((id) => {
        if (!salidas.some((s) => s.id === id)) delete next[id];
      });
      return next;
    });
  }, [open, salidas]);

  if (!open) return null;

  

  /**
   * Actualiza el archivo seleccionado para un entregable.
   *
   * @param id - Identificador del insumo.
   * @param file - Archivo adjunto por el usuario.
   */
  const setFile = (id: string, file: File | null) => {
    setValues((s) => ({ ...s, [id]: { kind: "Archivo", file } }));
  };

  

  /**
   * Actualiza el valor de texto asociado a un entregable.
   *
   * @param id - Identificador del insumo.
   * @param text - Contenido textual capturado.
   */
  const setText = (id: string, text: string) => {
    setValues((s) => ({ ...s, [id]: { kind: "Texto", text } }));
  };

  

  /**
   * Actualiza la opcion elegida para un entregable de tipo aprobacion.
   *
   * @param id - Identificador del insumo.
   * @param approved - Valor seleccionado por el usuario.
   */
  const setApproved = (id: string, approved: string) => {
    setValues((s) => ({ ...s, [id]: { kind: "Opcion", approved } }));
  };

  

  /**
   * Envia los valores capturados y cierra el modal al finalizar.
   */
  const handleSubmit = async () => {
    setSubmiting(true)
    await onSubmit(values)
    onClose()
    setSubmiting(false)
  };

  

  /**
   * Renderiza el control de entrada apropiado para cada entregable.
   *
   * @param s - Configuracion del insumo a capturar.
   * @returns Control JSX adecuado al tipo configurado.
   */
  const renderControl = (s: SalidaItem) => {
    const v = values[s.id];

    if (s.tipo === "Archivo") {
      const fileVal = v?.kind === "Archivo" ? v.file : null;
      return (
        <>
          <input type="file" className="field__input" onChange={(e) => setFile(s.id, e.target.files?.[0] ?? null)} disabled={submitting}/>
          {fileVal?.name ? (
            <small className="salidas-hint">Seleccionado: {fileVal.name}</small>
          ) : null}
        </>
      );
    }

    if (s.tipo === "Texto") {
      const textVal = v?.kind === "Texto" ? v.text : "";
      return (
        <textarea className="rrm-textarea" rows={2} placeholder="Escribe aquí..." value={textVal} onChange={(e) => setText(s.id, e.target.value)} disabled={submitting}/>
      );
    }

    // Opcion
    const approvedVal = v?.kind === "Opcion" ? v.approved : "";
    return (
      <select name="opcional" value={approvedVal} onChange={(e) => setApproved(s.id, e.target.value)} className="field__input">
        <option value="Si">Aprobado</option>
        <option value="No">No Aprobado</option>
      </select>
    );
  };

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={submitting ? undefined : onClose} />

      <div className="modal__panel" role="dialog" aria-modal="true">
        <h2 className="modal__title">Completar entregables</h2>
        <p className="modal__text">Antes de finalizar debes completar lo siguiente.</p>

        <ul className="salidas-list">
          {salidas.map((s) => (
            <li key={s.id} className="salidas-item">
              <div className="salidas-head">
                <strong className="salidas-title">{s.title}</strong>
              </div>

              {s.texto ? <p className="salidas-desc">{s.texto}</p> : null}

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

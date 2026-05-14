import React from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import "@cyntler/react-doc-viewer/dist/index.css";
import "./DocumentViewerModal.css";
import type { Archivo } from "../../models/Files";
import { triggerBrowserDownload } from "./documentViewerUtils";

type Props = {
  open: boolean;
  file: Archivo | null;
  onClose: () => void;
};

type NoRendererProps = {
  document?: { fileType?: string; uri?: string };
  fileName?: string;
};

function NoRendererFallback({ file, fileName }: { file: Archivo; fileName?: string }) {
  const handleDownload = React.useCallback(() => {
    triggerBrowserDownload(file);
  }, [file]);

  return (
    <div className="dvm-fallback">
      <p className="dvm-fallback-title">No hay vista previa disponible</p>
      <p className="dvm-fallback-text">
        Este archivo no pudo renderizarse en la pagina. Puedes descargarlo para abrirlo con la aplicacion adecuada.
      </p>
      <button type="button" className="dvm-btn dvm-btn-primary" onClick={handleDownload}>
        Descargar {fileName || file.name || "archivo"}
      </button>
    </div>
  );
}

export function DocumentViewerModal({ open, file, onClose }: Props) {
  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const documents = React.useMemo(() => {
    if (!file?.webUrl) return [];

    return [
      {
        uri: file.webUrl,
        fileName: file.name,
        fileType: file.mimeType,
      },
    ];
  }, [file]);

  const handleDownload = React.useCallback(() => {
    if (!file) return;
    triggerBrowserDownload(file);
  }, [file]);

  const noRenderer = React.useCallback(
    ({ fileName }: NoRendererProps) => (file ? <NoRendererFallback file={file} fileName={fileName} /> : null),
    [file]
  );

  if (!open || !file) return null;

  return (
    <div className="dvm-overlay" onClick={onClose}>
      <div className="dvm-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="dvm-header">
          <div className="dvm-title-wrap">
            <h3 className="dvm-title">{file.name || "Documento"}</h3>
            <p className="dvm-subtitle">{file.path}</p>
          </div>

          <div className="dvm-actions">
            <button type="button" className="dvm-btn dvm-btn-primary" onClick={handleDownload}>
              Descargar
            </button>
            <button type="button" className="dvm-btn dvm-btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>

        <div className="dvm-body">
          <div className="dvm-viewer">
            <DocViewer
              documents={documents}
              pluginRenderers={DocViewerRenderers}
              config={{
                header: {
                  disableHeader: true,
                  disableFileName: true,
                  retainURLParams: true,
                },
                noRenderer: {
                  overrideComponent: noRenderer,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

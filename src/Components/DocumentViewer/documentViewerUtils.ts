import type { Archivo } from "../../models/Files";

const SUPPORTED_EXTENSIONS = new Set([
  "bmp",
  "csv",
  "doc",
  "docx",
  "gif",
  "htm",
  "html",
  "jpeg",
  "jpg",
  "mp4",
  "odt",
  "pdf",
  "png",
  "ppt",
  "pptx",
  "tiff",
  "txt",
  "webp",
  "xls",
  "xlsx",
]);

const SUPPORTED_MIME_TYPES = new Set([
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/tiff",
  "image/webp",
  "text/csv",
  "text/html",
  "text/htm",
  "text/plain",
  "video/mp4",
]);

function getFileExtension(value: string) {
  const clean = value.split("?")[0].trim().toLowerCase();
  const lastDot = clean.lastIndexOf(".");
  return lastDot >= 0 ? clean.slice(lastDot + 1) : "";
}

export function isPreviewSupported(file: Archivo) {
  const extension = getFileExtension(file.name || file.path || file.webUrl || "");
  const mimeType = String(file.mimeType ?? "").trim().toLowerCase();

  return SUPPORTED_EXTENSIONS.has(extension) || SUPPORTED_MIME_TYPES.has(mimeType);
}

export function triggerBrowserDownload(file: Archivo) {
  if (!file.webUrl) {
    throw new Error("No se pudo obtener la URL del archivo.");
  }

  const anchor = document.createElement("a");
  anchor.href = file.webUrl;
  anchor.download = file.name || "archivo";
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

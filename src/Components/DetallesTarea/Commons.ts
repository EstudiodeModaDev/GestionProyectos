import type { SalidaItem } from "../NuevoProyectoModal/NuevoProyectoModal.types";
import type { SalidaValue } from "./DetallesTarea";

export function hasExistingValue(item: SalidaItem): boolean {
  if (item.estado !== "Subido") return false;
  if (item.tipo === "Archivo") return Boolean(item.fileName || item.texto);
  return Boolean(item.texto?.trim());
};

export function initialValueFor(item: SalidaItem): SalidaValue{
  if (item.tipo === "Archivo") return { kind: "Archivo", file: null };
  if (item.tipo === "Texto") return { kind: "Texto", text: item.texto ?? "" };
  if (item.tipo === "Fecha") return { kind: "Fecha", date: item.texto ?? "" };
  return { kind: "Opcion", approved: item.texto ?? "" };
};

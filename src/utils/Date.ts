export function toGraphDateTime(
  v: Date | { toISOString: () => string } | string | null | undefined
): string | undefined {
  if (!v) return undefined;

  // Si ya viene string ISO/fecha válida, respétalo
  if (typeof v === "string") {
    // "YYYY-MM-DD" o "YYYY-MM-DDTHH:mm:ss(.sss)Z"
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) return v;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  // TZDate, Date u objeto con toISOString()
  try {
    const iso = (v as any).toISOString?.();
    if (typeof iso === "string" && iso) return iso;
  } catch {}

  const d = new Date(v as any);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function ParseDateTimeShow(fecha: string){
  try{
    const fechaParse = new Date(fecha)
    const shortDate = fechaParse.toLocaleString("es-CO", {day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false});
    return shortDate
  }catch{
    return "N/A"
  }
}

export function ParseDateShow(fecha: string){
  try{
    const fechaParse = new Date(fecha)
    const shortDate = fechaParse.toLocaleString("es-CO", {day: "2-digit", month: "2-digit", year: "numeric",});
    return shortDate
  }catch{
    return "N/A"
  }
}


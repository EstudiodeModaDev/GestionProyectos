import type { Holiday } from "festivos-colombianos";
import * as React from "react";
import { fetchHolidays } from "../Holidays";

/**
 * Carga y expone los festivos disponibles para cálculos del dominio.
 * @returns Lista de festivos y setter asociado.
 */
export function useHolidays() {
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);

  React.useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const hs = await fetchHolidays();
        if (!cancel) setHolidays(hs);
      } catch (e) {
        if (!cancel) console.error("Error festivos:", e);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { holidays, setHolidays };
}

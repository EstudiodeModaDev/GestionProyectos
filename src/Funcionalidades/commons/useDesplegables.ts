import * as React from "react";
import type { MarcasService } from "../../services/Marcas.service";
import type { desplegable, desplegablesOption } from "../../models/desplegables";
import type { ZonasService } from "../../services/Zonas.service";

/**
 * Configuración base requerida por el hook genérico de desplegables.
 */
type DesplegableConfig<T> = {
  load: (search?: string) => Promise<T[]>;
  getId: (item: T) => string | number;
  getLabel: (item: T) => string;
  getIsActive?: (item: T) => boolean;
  includeIdInLabel?: boolean;
  fallbackIfEmptyTitle?: string;
  idPrefix?: string;
  addItem?: (payload: any) => Promise<T>;
  deleteItem?: (id: string | number) => Promise<void>;
  editItem?: (payload: any, id: string) => Promise<T>;
};

/**
 * Resultado estándar del hook genérico de desplegables.
 */
type UseDesplegableResult<T> = {
  items: T[];
  options: desplegablesOption[];
  loading: boolean;
  error: string | null;
  reload: (search?: string) => Promise<void>;
  add?: (payload: any) => Promise<T | null>;
  remove?: (id: string | number) => Promise<boolean>;
  editItem?: (payload: any, id: string) => Promise<T>;
};

/**
 * Hook genérico para listar y administrar valores de desplegables.
 * @param config - Estrategias de carga, mapeo y modificación de elementos.
 * @returns Colección, opciones derivadas y acciones CRUD.
 */
export function useDesplegable<T>(config: DesplegableConfig<T>): UseDesplegableResult<T> {
  const {
    load,
    getId,
    getLabel,
    includeIdInLabel = true,
    fallbackIfEmptyTitle = "(Sin tÃ­tulo)",
    idPrefix = "#",
    addItem,
    deleteItem,
    editItem,
    getIsActive
  } = config;
  const [items, setItems] = React.useState<T[]>([]);
  const [options, setOptions] = React.useState<desplegablesOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Recarga los elementos disponibles.
   * @param search - Texto opcional de búsqueda.
   */
  const reload = React.useCallback(async (search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await load(search);
      setItems(data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando datos");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [load]);

  /**
   * Agrega un nuevo elemento al desplegable.
   * @param payload - Datos del elemento a crear.
   * @returns Elemento creado o `null` si falla.
   */
  const add = React.useCallback(async (payload: any): Promise<T | null> => {
    if (!addItem) {
      console.warn("addItem no estÃ¡ definido en este desplegable");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const created = await addItem(payload);
      setItems((prev) => [...prev, created]);
      return created;
    } catch (e: any) {
      setError(e?.message ?? "Error creando elemento");
      return null;
    } finally {
      setLoading(false);
    }
  }, [addItem]);

  /**
   * Elimina un elemento existente del desplegable.
   * @param id - Identificador del elemento.
   * @returns `true` cuando la eliminación fue exitosa.
   */
  const remove = React.useCallback(async (id: string | number): Promise<boolean> => {
    if (!deleteItem) {
      console.warn("deleteItem no estÃ¡ definido en este desplegable");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((it) => String(getId(it)) !== String(id)));
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Error eliminando elemento");
      return false;
    } finally {
      setLoading(false);
    }
  }, [deleteItem, getId]);

  React.useEffect(() => {
    const seen = new Set<string>();
    const next: desplegablesOption[] = items
      .map((item) => {
        const rawId = getId(item);
        const id = String(rawId);
        const base = (getLabel(item) ?? "").trim() || fallbackIfEmptyTitle;
        const label = includeIdInLabel ? `${base} â€” ID: ${idPrefix}${id}` : base;
        const isAvtive = getIsActive ? getIsActive(item) : false;
        return { value: id, label, isActive: isAvtive };
      })
      .filter((opt) => {
        if (seen.has(opt.value)) return false;
        seen.add(opt.value);
        return true;
      });

    setOptions(next);
  }, [items, includeIdInLabel, fallbackIfEmptyTitle, idPrefix]);

  return {
    items,
    options,
    loading,
    error,
    reload,
    add: addItem ? add : undefined,
    remove: deleteItem ? remove : undefined,
    editItem,
  };
}

/**
 * Hook especializado para gestionar el desplegable de marcas.
 * @param marcasSvc - Servicio de marcas.
 * @returns API del desplegable adaptada al dominio de marcas.
 */
export function useMarcas(marcasSvc: MarcasService) {
  const load = React.useCallback(async (search?: string) => {
    const items = await marcasSvc.getAll();
    if (!search) return items.items;

    const term = search.toLowerCase();
    return items.items.filter((e: desplegable) =>
      (e.Title ?? "").toLowerCase().includes(term)
    );
  }, [marcasSvc]);

  const addItem = React.useCallback((payload: desplegable) => marcasSvc.create(payload), [marcasSvc]);
  const editItem = React.useCallback((payload: desplegable, id: string) => marcasSvc.update(id, payload), [marcasSvc]);
  const deleteItem = React.useCallback((id: string | number) => marcasSvc.delete(String(id)), [marcasSvc]);

  return useDesplegable<desplegable>({
    load,
    addItem,
    editItem,
    deleteItem,
    getId: (e) => e.Id ?? e.Title,
    getLabel: (e) => e.Title ?? "",
    includeIdInLabel: false,
    fallbackIfEmptyTitle: "(Sin nombre)",
    idPrefix: "#",
    getIsActive: (e) => e.IsActive ?? false
  });
}

/**
 * Hook especializado para gestionar el desplegable de zonas.
 * @param marcasSvc - Servicio de zonas.
 * @returns API del desplegable adaptada al dominio de zonas.
 */
export function useZonas(marcasSvc: ZonasService) {
  const load = React.useCallback(async (search?: string) => {
    const items = await marcasSvc.getAll();
    if (!search) return items.items;

    const term = search.toLowerCase();
    return items.items.filter((e: desplegable) =>
      (e.Title ?? "").toLowerCase().includes(term)
    );
  }, [marcasSvc]);

  const addItem = React.useCallback((payload: desplegable) => marcasSvc.create(payload), [marcasSvc]);
  const editItem = React.useCallback((payload: desplegable, id: string) => marcasSvc.update(id, payload), [marcasSvc]);
  const deleteItem = React.useCallback((id: string | number) => marcasSvc.delete(String(id)), [marcasSvc]);

  return useDesplegable<desplegable>({
    load,
    addItem,
    editItem,
    deleteItem,
    getId: (e) => e.Id ?? e.Title,
    getLabel: (e) => e.Title ?? "",
    includeIdInLabel: false,
    fallbackIfEmptyTitle: "(Sin nombre)",
    idPrefix: "#",
    getIsActive: (e) => e.IsActive ?? false
  });
}

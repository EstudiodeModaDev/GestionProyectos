import React from "react";
import { useAuth } from "../auth/authProvider";
import type { ProyectosServices } from "../services/Projets.service";
import type { ProjectSP } from "../models/Projects";
import { toGraphDateTime } from "../utils/Date";

export function useProjects(Proyectos: ProyectosServices) {
  const [rows, setRows] = React.useState<ProjectSP[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState<string>("");
  const {account} = useAuth()
  const today = React.useMemo(() => toGraphDateTime(new Date()), []);
  const [state, setState] = React.useState<ProjectSP>({
    Descripcion: "",
    Estado: "",
    Title: "",
    CorreoLider: account?.username ?? "",
    Fechadelanzamiento: "",
    FechaInicio: today!,
    fulfillment: 0,
    Lider: account?.name ?? "",
    Progreso: "0",
  });
  const setField = <K extends keyof ProjectSP>(k: K, v: ProjectSP[K]) => setState((s) => ({ ...s, [k]: v }));
  
  const loadFirstPage = React.useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const items = await Proyectos.getAll();
      setRows(items);
    } catch (e: any) {
      setError(e?.message ?? "Error cargando tickets");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [Proyectos]);

  const cleanState = React.useCallback(() => {
    setState({
      Descripcion: "",
      Estado: "",
      Title: "",
      CorreoLider: account?.username ?? "",
      Fechadelanzamiento: "",
      FechaInicio: today!,
      fulfillment: 0,
      Lider: account?.name ?? "",
      Progreso: "0",
    });
  }, [Proyectos]);

  React.useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage, search]);

  // recargas por cambios externos
  const applyRange = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage]);
  const reloadAll  = React.useCallback(() => { loadFirstPage(); }, [loadFirstPage, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
          
      // Objeto de creación
      const payload: ProjectSP = {
        Descripcion: state.Descripcion ?? "",
        Estado: "En curso",
        Title: state.Title,
        CorreoLider: state.CorreoLider,
        Fechadelanzamiento: toGraphDateTime(state.Fechadelanzamiento)!,
        FechaInicio: toGraphDateTime(state.FechaInicio)!,
        fulfillment: 0,
        Lider: state.Lider,
        Progreso: "0"
      };
      const created = await Proyectos.create(payload);
      alert("Se ha creado el registro con éxito")
      return created
    } finally {
        setLoading(false);
        cleanState();
      }
  };

  const changeName = async (e: React.FormEvent, Id: string) => {
    e.preventDefault();
    setLoading(true);
    try {
          
      const created = await Proyectos.update(Id, {Title: state.Title});
      alert("Se ha actualizado el registro con éxito")
      return created
    } finally {
        setLoading(false);
      }
  };

  const archiveProject = async (e: React.FormEvent, Id: string) => {
    e.preventDefault();
    setLoading(true);
    try {
          
      const created = await Proyectos.update(Id, {Estado: "Cancelado"});
      alert("Se ha actualizado el registro con éxito")
      return created
    } finally {
        setLoading(false);
      }
  };

  const updatePorcentaje = async (Id: string, porcentaje: number) => {
    setLoading(true);
    try {
      await Proyectos.update(Id, {Progreso: porcentaje.toString()});
    } finally {
        setLoading(false);
    }
  };

  return {
    rows, loading, error, search, state,
    applyRange, reloadAll, setSearch, setField, handleSubmit, loadFirstPage, changeName, archiveProject, updatePorcentaje
  };
}



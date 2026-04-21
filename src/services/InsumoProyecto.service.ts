import type { GraphRest } from "../graph/graphRest";
import type { InsumoProyecto } from "../models/Insumos";
import { BaseSharePointListService } from "./Base.service";

/**
 * Servicio para gestionar los insumos del proyecto almacenados en SharePoint.
 */
export class InsumoProyectoService extends BaseSharePointListService<InsumoProyecto> {
  /**
   * Inicializa una nueva instancia del servicio de insumos del proyecto.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   */
  constructor(graph: GraphRest) {
    super(
      graph,
      "estudiodemoda.sharepoint.com",
      "/sites/TransformacionDigital/IN/Test",
      "Apertura Tiendas - Insumos Proyecto"
    );
  }

  /**
   * Convierte un elemento bruto de SharePoint en el modelo `InsumoProyecto`.
   * @param item - Elemento devuelto por Microsoft Graph.
   * @returns Modelo normalizado del insumo.
   */
  protected toModel(item: any): InsumoProyecto {
    const f = item?.fields ?? {};

    return {
      Id: String(item?.id ?? ""),
      Title: f.Title,
      CategoriaInsumo: f.CategoriaInsumo,
      IdInsumo: f.IdInsumo,
      Texto: f.Texto,
      TipoInsumo: f.TipoInsumo,
      NombreInsumo: f.NombreInsumo,
      insumoId: f.insumoId,
    };
  }

  /**
   * Obtiene un elemento por su identificador.
   * @param ids - Lista con los identificadores.
   * @returns lista de resultados.
   */
  async getByIds(ids: string[]): Promise<InsumoProyecto[]> {
    const results: InsumoProyecto[] = []
    for(const id of ids){
      const res = await this.get(id)
      if(res) results.push(res)
    }

    return results
  }
  
}

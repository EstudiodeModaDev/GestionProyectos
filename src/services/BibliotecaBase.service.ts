import type { GraphRest } from "../graph/graphRest";
import type { Archivo } from "../models/Files";

type GraphPaged<T> = {
  value: T[];
  "@odata.nextLink"?: string;
};

/**
 * Convierte un `nextLink` absoluto de Graph en una ruta relativa reutilizable por el cliente.
 * @param nextLink - URL absoluta devuelta por Microsoft Graph.
 * @returns Ruta relativa con su cadena de consulta.
 */
function toRelativePath(nextLink: string): string {
  const u = new URL(nextLink);

  // u.pathname normalmente es "/v1.0/drives/..."
  // el wrapper ya tiene base ".../v1.0/", así que quitamos ese prefijo
  const p = u.pathname.replace(/^\/v1\.0/i, "");

  return p + u.search;
}

/**
 * Transforma un elemento de Graph en el modelo `Archivo`.
 * @param item - Elemento bruto devuelto por Microsoft Graph.
 * @returns Archivo normalizado.
 */
function mapToArchivo(item: any): Archivo {
  const parentPath = item.parentReference?.path ?? "";
  const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

  return {
    id: item.id,
    name: item.name,
    webUrl: item.webUrl,
    isFolder: !!item.folder,
    size: item.size,
    lastModified: item.lastModifiedDateTime,
    childCount: item.folder?.childCount ?? undefined,
    created: item.createdDateTime,
    path: fullPath,
  };
}

/**
 * Servicio base para interactuar con bibliotecas de documentos en SharePoint.
 */
export class BibliotecaBaseService {
  protected graph: GraphRest;
  protected hostname: string;
  protected sitePath: string;
  protected libraryName: string;

  protected siteId?: string;
  protected driveId?: string;

  /**
   * Inicializa una nueva instancia del servicio de biblioteca.
   * @param graph - Cliente para realizar peticiones a Microsoft Graph.
   * @param hostname - Host del sitio de SharePoint.
   * @param sitePath - Ruta relativa del sitio.
   * @param libraryName - Nombre de la biblioteca de documentos.
   */
  constructor(
    graph: GraphRest,
    hostname: string,
    sitePath: string,
    libraryName: string
  ) {
    this.graph = graph;
    this.hostname = hostname;
    this.sitePath = sitePath.startsWith("/") ? sitePath : `/${sitePath}`;
    this.libraryName = libraryName;
  }

  /**
   * Carga desde caché los identificadores resueltos del sitio y la biblioteca.
   */
  private loadCache() {
    try {
      const k = `sp-drive:${this.hostname}${this.sitePath}:${this.libraryName}`;
      const raw = localStorage.getItem(k);
      if (raw) {
        const { siteId, driveId } = JSON.parse(raw);
        this.siteId = siteId || this.siteId;
        this.driveId = driveId || this.driveId;
      }
    } catch {}
  }

  /**
   * Guarda en caché los identificadores resueltos del sitio y la biblioteca.
   */
  private saveCache() {
    try {
      const k = `sp-drive:${this.hostname}${this.sitePath}:${this.libraryName}`;
      localStorage.setItem(
        k,
        JSON.stringify({ siteId: this.siteId, driveId: this.driveId })
      );
    } catch {}
  }

  /**
   * Resuelve y cachea el identificador del sitio y del drive asociado a la biblioteca.
   * @returns Promesa resuelta cuando ambos identificadores están disponibles.
   */
  protected async ensureIds() {
    if (!this.siteId || !this.driveId) this.loadCache();

    if (!this.siteId) {
      const site = await this.graph.get<any>(
        `/sites/${this.hostname}:${this.sitePath}`
      );
      this.siteId = site?.id;
      if (!this.siteId) throw new Error("No se pudo resolver siteId");
      this.saveCache();
    }

    if (!this.driveId) {
      const drivesRes = await this.graph.get<any>(
        `/sites/${this.siteId}/drives`
      );
      const drive = (drivesRes?.value ?? []).find(
        (d: any) => d.name === this.libraryName
      );
      if (!drive?.id) {
        throw new Error(`Biblioteca no encontrada: ${this.libraryName}`);
      }
      this.driveId = drive.id;
      this.saveCache();
    }
  }

  /**
   * Codifica una ruta de carpeta para usarla en endpoints de Graph.
   * @param p - Ruta relativa a codificar.
   * @returns Ruta codificada por segmentos.
   */
  private encodePath(p: string) {
    const clean = (p ?? "").replace(/^\/|\/$/g, "");
    if (!clean) return "";
    return clean
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/");
  }

  /**
   * Lista todos los archivos y carpetas contenidos en una carpeta.
   * @param folderPath - Ruta relativa de la carpeta dentro de la biblioteca.
   * @returns Colección completa de archivos paginada internamente.
   */
  async getFilesInFolder(folderPath: string): Promise<Archivo[]> {
    await this.ensureIds();

    const encodedPath = this.encodePath(folderPath);
    let url =
      encodedPath.length > 0
        ? `/drives/${this.driveId}/root:/${encodedPath}:/children?$top=200`
        : `/drives/${this.driveId}/root/children?$top=200`;

    const all: any[] = [];

    while (url) {
      const res = await this.graph.get<GraphPaged<any>>(url);
      all.push(...(res.value ?? []));
      const next = res["@odata.nextLink"];
      url = next ? toRelativePath(next) : "";
    }

    return all.map(mapToArchivo);
  }

  /**
   * Lista los elementos hijos de una carpeta a partir de su identificador.
   * @param folderId - Identificador del elemento carpeta.
   * @returns Colección completa de archivos paginada internamente.
   */
  async getFilesByFolderId(folderId: string): Promise<Archivo[]> {
    await this.ensureIds();

    let url = `/drives/${this.driveId}/items/${folderId}/children?$top=200`;
    const all: any[] = [];

    while (url) {
      const res = await this.graph.get<GraphPaged<any>>(url);
      all.push(...(res.value ?? []));
      const next = res["@odata.nextLink"];
      url = next ? toRelativePath(next) : "";
    }

    return all.map(mapToArchivo);
  }

  /**
   * Busca una carpeta cuyo nombre inicie con el número de documento indicado.
   * @param docNumber - Número de documento a localizar.
   * @returns Carpeta encontrada o `null` si no existe coincidencia.
   */
  async findFolderByDocNumber(docNumber: string): Promise<Archivo | null> {
    await this.ensureIds();

    const canon = (s: string) =>
      (s ?? "")
        .toString()
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const baseFolder = "Colaboradores Activos";
    const encodedBase = this.encodePath(baseFolder);

    let url = `/drives/${this.driveId}/root:/${encodedBase}:/children?$top=200`;

    const doc = canon(docNumber);
    const prefix = `${doc} -`;

    while (url) {
      const res = await this.graph.get<GraphPaged<any>>(url);
      const items: any[] = res.value ?? [];

      const folder = items.find((item) => {
        if (!item?.folder) return false;
        const name = canon(item?.name ?? "");
        return name.startsWith(prefix);
      });

      if (folder) {
        const parentPath = folder.parentReference?.path ?? "";
        const fullPath = parentPath ? `${parentPath}/${folder.name}` : folder.name;

        return {
          id: folder.id,
          name: folder.name,
          webUrl: folder.webUrl,
          isFolder: !!folder.folder,
          size: folder.size,
          lastModified: folder.lastModifiedDateTime,
          childCount: folder.folder?.childCount ?? undefined,
          created: folder.createdDateTime,
          path: fullPath,
        };
      }

      const next = res["@odata.nextLink"];
      url = next ? toRelativePath(next) : "";
    }

    return null;
  }

  /**
   * Sube un archivo dentro de una carpeta usando su identificador.
   * @param folderId - Identificador de la carpeta destino.
   * @param file - Archivo a cargar.
   * @returns Metadatos del archivo creado.
   */
  async uploadFileByFolderId(folderId: string, file: File): Promise<Archivo> {
    await this.ensureIds();

    if (!folderId) throw new Error("folderId es requerido");
    if (!file?.name) throw new Error("Archivo inválido");

    const fileName = file.name;
    const encodedName = encodeURIComponent(fileName);

    const driveItem = await this.graph.putBinary<any>(
      `/drives/${this.driveId}/items/${folderId}:/${encodedName}:/content`,
      file,
      file.type || "application/octet-stream"
    );

    const parentPath = driveItem.parentReference?.path ?? "";
    const fullPath = parentPath
      ? `${parentPath}/${driveItem.name}`
      : driveItem.name;

    return {
      id: driveItem.id,
      name: driveItem.name,
      webUrl: driveItem.webUrl,
      isFolder: !!driveItem.folder,
      size: driveItem.size,
      lastModified: driveItem.lastModifiedDateTime,
      childCount: driveItem.folder?.childCount ?? undefined,
      created: driveItem.createdDateTime,
      path: fullPath,
    };
  }

  /**
   * Sube un archivo a una carpeta usando su ruta relativa.
   * @param folderPath - Ruta de la carpeta destino.
   * @param file - Archivo a cargar.
   * @param name - Nombre opcional sin extensión para el archivo final.
   * @returns Metadatos del archivo creado.
   */
  async uploadFile(folderPath: string, file: File, name?: string): Promise<Archivo> {
    await this.ensureIds();

    const ext = file.name.split(".")[1];
    const cleanFolder = (folderPath ?? "").replace(/^\/|\/$/g, "");
    const fileName = name ? `${name}.${ext}` : file.name;

    const serverPath = cleanFolder.length > 0 ? `${cleanFolder}/${fileName}` : fileName;

    console.log(serverPath);

    const driveItem = await this.graph.putBinary<any>(
      `/drives/${this.driveId}/root:/${encodeURI(serverPath)}:/content`,
      file,
      file.type || "application/octet-stream"
    );

    console.log("Archivo subido, info del driveItem:", driveItem);

    const parentPath = driveItem.parentReference?.path ?? "";
    const fullPath = parentPath
      ? `${parentPath}/${driveItem.name}`
      : driveItem.name;

    return {
      id: driveItem.id,
      name: driveItem.name,
      webUrl: driveItem.webUrl,
      isFolder: !!driveItem.folder,
      size: driveItem.size,
      lastModified: driveItem.lastModifiedDateTime,
      childCount: driveItem.folder?.childCount ?? undefined,
      created: driveItem.createdDateTime,
      path: fullPath,
    };
  }

  /**
   * Renombra un archivo o carpeta conservando la extensión cuando aplica.
   * @param archivo - Elemento a renombrar.
   * @param nuevoNombreSinExtension - Nuevo nombre base del elemento.
   * @returns Metadatos actualizados del elemento.
   */
  async renameArchivo(archivo: Archivo, nuevoNombreSinExtension: string): Promise<Archivo> {
    await this.ensureIds();

    let ext = "";
    if (!archivo.isFolder) {
      const dot = archivo.name.lastIndexOf(".");
      if (dot > 0) ext = archivo.name.slice(dot);
    }

    const newName = `${nuevoNombreSinExtension}${ext}`;

    const item = await this.graph.patch<any>(
      `/drives/${this.driveId}/items/${archivo.id}`,
      { name: newName }
    );

    const parentPath = item.parentReference?.path ?? "";
    const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    return {
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      isFolder: !!item.folder,
      size: item.size,
      lastModified: item.lastModifiedDateTime,
      childCount: item.folder?.childCount ?? undefined,
      created: item.createdDateTime,
      path: fullPath,
    };
  }

  /**
   * Mueve una carpeta a otra carpeta padre y opcionalmente la renombra.
   * @param sourceFolderPath - Ruta actual de la carpeta a mover.
   * @param destParentFolderPath - Ruta de la carpeta destino.
   * @param opts - Opciones adicionales para el movimiento.
   * @returns Metadatos de la carpeta movida.
   */
  async moveFolderByPath(
    sourceFolderPath: string,
    destParentFolderPath: string,
    opts?: { newName?: string }
  ): Promise<Archivo> {
    await this.ensureIds();

    const enc = (p: string) =>
      (p ?? "")
        .replace(/^\/|\/$/g, "")
        .split("/")
        .map(encodeURIComponent)
        .join("/");

    const srcPath = enc(sourceFolderPath);
    const dstPath = enc(destParentFolderPath);

    const src = await this.graph.get<any>(`/drives/${this.driveId}/root:/${srcPath}`);
    if (!src?.id || !src?.folder) {
      throw new Error("La ruta origen no es una carpeta válida o no existe.");
    }

    const dst = await this.graph.get<any>(`/drives/${this.driveId}/root:/${dstPath}`);
    if (!dst?.id || !dst?.folder) {
      throw new Error("La ruta destino no es una carpeta válida o no existe.");
    }

    const body: any = { parentReference: { id: dst.id } };
    const newName = opts?.newName?.trim();
    if (newName) body.name = newName;

    const moved = await this.graph.patch<any>(
      `/drives/${this.driveId}/items/${src.id}`,
      body
    );

    const parentPath = moved.parentReference?.path ?? "";
    const fullPath = parentPath ? `${parentPath}/${moved.name}` : moved.name;

    return {
      id: moved.id,
      name: moved.name,
      webUrl: moved.webUrl,
      isFolder: !!moved.folder,
      size: moved.size,
      lastModified: moved.lastModifiedDateTime,
      childCount: moved.folder?.childCount ?? undefined,
      created: moved.createdDateTime,
      path: fullPath,
    };
  }

  /**
   * Elimina un archivo o carpeta por su identificador.
   * @param itemId - Identificador del elemento a eliminar.
   */
  async deleteArchivoById(itemId: string): Promise<void> {
    await this.ensureIds();

    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    await this.graph.delete(`/drives/${this.driveId}/items/${itemId}`);
  }

  /**
   * Obtiene un archivo o carpeta por su identificador.
   * @param itemId - Identificador del elemento.
   * @returns Metadatos normalizados del elemento.
   */
  async getFileById(itemId: string): Promise<Archivo> {
    await this.ensureIds();

    if (!itemId) {
      throw new Error("itemId es requerido");
    }

    const item = await this.graph.get<any>(
      `/drives/${this.driveId}/items/${itemId}`
    );

    const parentPath = item.parentReference?.path ?? "";
    const fullPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    return {
      id: item.id,
      name: item.name,
      webUrl: item.webUrl,
      isFolder: !!item.folder,
      size: item.size,
      lastModified: item.lastModifiedDateTime,
      childCount: item.folder?.childCount ?? undefined,
      created: item.createdDateTime,
      path: fullPath,
    };
  }
}
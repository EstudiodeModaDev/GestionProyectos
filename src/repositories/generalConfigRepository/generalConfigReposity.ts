
export interface GeneralConfigRepository {
  loadConfigs(): Promise<any[]>;
  createConfig(payload: any): Promise<any>;
}

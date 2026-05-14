import type { ReglasFlujoTareas } from "../../models/Insumos";

type FlowRuleFilters = {
  id_template_task_origen?: string | number;
  id_template_task_destino?: string | number;
  is_active?: boolean;
};

export interface RulesFlujoRepository {
  loadAllRules(): Promise<ReglasFlujoTareas[]>;
  loadFilterRules(filters: FlowRuleFilters): Promise<ReglasFlujoTareas[]>;
  createRule(payload: ReglasFlujoTareas): Promise<ReglasFlujoTareas>;
  updateRule(id: string, payload: ReglasFlujoTareas): Promise<ReglasFlujoTareas>;
  inactivateRule(id: string): Promise<void>;
}

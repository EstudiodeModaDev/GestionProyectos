import * as React from "react";
import { useAuth } from "../../auth/authProvider";
import { SupabaseApiService } from "../../services/supabase.service";

export function useSupabaseApi() {
  const { getApiToken } = useAuth();

  return React.useMemo(() => new SupabaseApiService(getApiToken), [getApiToken]);
}

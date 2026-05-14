import type { createClient } from "jsr:@supabase/supabase-js@2";

export type ActionBody = {
  action: string;
  payload?: Record<string, unknown>;
};

export type EntraClaims = Record<string, unknown> & {
  tid?: string;
  oid?: string;
  iss?: string;
  exp?: number;
  preferred_username?: string;
  email?: string;
  name?: string;
  aud?: string;
  scp?: string;
};

export type SupabaseClient = ReturnType<typeof createClient>;

export type CrudConfig = {
  table: string;
  idColumn: string;
  defaultOrderBy?: { column: string; ascending?: boolean };
  buildListQuery?: (
    query: ReturnType<SupabaseClient["from"]>["select"],
    payload: Record<string, unknown>
  ) => ReturnType<SupabaseClient["from"]>["select"];
  buildCreate: (payload: Record<string, unknown>) => Record<string, unknown>;
  buildUpdate: (payload: Record<string, unknown>) => Record<string, unknown>;
};

export type ActionHandler = (
  payload: Record<string, unknown>,
  claims: EntraClaims,
  supabase: SupabaseClient
) => Promise<unknown>;

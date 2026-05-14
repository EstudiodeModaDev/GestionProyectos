type SupabaseActionPayload = Record<string, unknown>;

type SupabaseApiEnvelope<T> = {
  data?: T;
  error?: string;
};

const supabaseEdgeApiUrl = import.meta.env.VITE_SUPABASE_EDGE_API_URL ?? "";

export class SupabaseApiService {
  private readonly getApiToken: () => Promise<string>;
  private readonly apiUrl: string;

  constructor(getApiToken: () => Promise<string>, apiUrl = supabaseEdgeApiUrl) {
    this.getApiToken = getApiToken;
    this.apiUrl = apiUrl;
  }

  private ensureApiUrl(): string {
    if (!this.apiUrl) {
      throw new Error(
        "No se ha configurado VITE_SUPABASE_EDGE_API_URL. Define la URL de tu Edge Function para usar Supabase mediante Entra ID."
      );
    }

    return this.apiUrl;
  }

  async call<TResult, TPayload extends SupabaseActionPayload = SupabaseActionPayload>(
    action: string,
    payload?: TPayload
  ): Promise<TResult> {
    const [token, url] = await Promise.all([this.getApiToken(), Promise.resolve(this.ensureApiUrl())]);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        payload: payload ?? {},
      }),
    });

    const body = (await response.json().catch(() => null)) as SupabaseApiEnvelope<TResult> | null;

    if (!response.ok) {
      throw new Error(body?.error ?? `Error invocando la API de Supabase (${response.status}).`);
    }

    return body?.data as TResult;
  }
}

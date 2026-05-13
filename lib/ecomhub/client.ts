/**
 * Cliente da API EcomHub.
 *
 * IMPORTANTE: Este arquivo NUNCA deve ser importado em código client-side.
 * Token e Secret só existem no servidor (variáveis de ambiente sem NEXT_PUBLIC_).
 */

import "server-only";
import type {
  EcomHubCountry,
  EcomHubStore,
  EcomHubOrder,
  EcomHubCreateOrderInput,
  EcomHubCreateOrderResponse,
  EcomHubResult,
} from "./types";

const BASE_URL = process.env.ECOMHUB_BASE_URL ?? "https://api.ecomhub.app";
const TOKEN = process.env.ECOMHUB_TOKEN;
const SECRET = process.env.ECOMHUB_SECRET;

function assertEnv() {
  if (!TOKEN || !SECRET) {
    throw new Error(
      "ECOMHUB_TOKEN e ECOMHUB_SECRET precisam estar definidos no .env"
    );
  }
}

type RequestOpts = {
  method?: "GET" | "POST";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

async function ecomhubFetch<T>(
  path: string,
  opts: RequestOpts = {}
): Promise<EcomHubResult<T>> {
  assertEnv();
  const start = Date.now();

  const url = new URL(BASE_URL + path);
  url.searchParams.set("token", TOKEN!);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  let httpStatus = 0;
  try {
    const res = await fetch(url.toString(), {
      method: opts.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        Secret: SECRET!,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    httpStatus = res.status;
    const json = await res.json().catch(() => ({}));
    const durationMs = Date.now() - start;

    if (!res.ok) {
      return {
        ok: false,
        error: {
          code: json?.error?.code ?? `HTTP_${res.status}`,
          context: json?.error?.context ?? res.statusText ?? "Erro desconhecido",
        },
        durationMs,
        httpStatus,
      };
    }

    if (json?.error) {
      return {
        ok: false,
        error: { code: json.error.code, context: json.error.context },
        durationMs,
        httpStatus,
      };
    }

    return { ok: true, data: json as T, durationMs, httpStatus };
  } catch (err) {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        context: err instanceof Error ? err.message : "Falha de rede",
      },
      durationMs: Date.now() - start,
      httpStatus,
    };
  }
}

// ============ FUNÇÕES PÚBLICAS ============

export async function getEcomHubCountries() {
  return ecomhubFetch<EcomHubCountry[]>("/apps/countries");
}

export async function getEcomHubStore() {
  return ecomhubFetch<EcomHubStore>("/apps/stores");
}

export async function getEcomHubOrders(params: {
  orderBy?: "date" | "updatedAt";
  skip?: number;
} = {}) {
  return ecomhubFetch<EcomHubOrder[]>("/apps/orders", {
    query: {
      orderBy: params.orderBy ?? "date",
      skip: params.skip ?? 0,
    },
  });
}

export async function createEcomHubOrder(input: EcomHubCreateOrderInput) {
  return ecomhubFetch<{ id: string }>("/apps/orders/create", {
    method: "POST",
    body: input,
  });
}

export type { EcomHubCreateOrderInput, EcomHubCreateOrderResponse };

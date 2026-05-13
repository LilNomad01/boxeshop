'use client';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FACEBOOK — Eventos de Browser (Pixel) + Conversions API (server-side)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CONFIGURAÇÃO NO .env.local:
 *   NEXT_PUBLIC_FB_PIXEL_ID=seu_pixel_id_aqui
 *   FB_ACCESS_TOKEN=seu_access_token_da_capi_aqui
 *
 * O script do Pixel deve estar carregado no layout.tsx (via <Script> do Next.js).
 * Os eventos são enviados em paralelo:
 *   - via window.fbq()          → Pixel (browser)
 *   - via POST /api/fbcapi      → Conversions API (server-side, deduplicado por event_id)
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? '';
const DEFAULT_CURRENCY = 'EUR';

// ─── Tipos globais ────────────────────────────────────────────────────────────

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbUserData?: { em: string; ph: string; external_id: string };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((r) => r.startsWith(name + '='))
    ?.split('=')[1];
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const exp = new Date();
  exp.setTime(exp.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${exp.toUTCString()}; path=/; SameSite=Lax`;
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getOrCreateExternalId(): string {
  let id = getCookie('_extid');
  if (!id) {
    id = uuidv4();
    setCookie('_extid', id, 180);
  }
  return id;
}

function genEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toPrice(v: number): number {
  return Math.round(v * 100) / 100;
}

// ─── Tipos de dados ───────────────────────────────────────────────────────────

interface UserData {
  email?:       string;
  phone?:       string;
  fn?:          string;
  ln?:          string;
  ct?:          string;
  st?:          string;
  zp?:          string;
  country?:     string;
  external_id?: string;
}

interface EventData extends UserData {
  value?:        number;
  currency?:     string;
  contents?:     Array<{ id: string; quantity: number; item_price?: number }>;
  num_items?:    number;
  content_type?: string;
  content_name?: string;
  content_ids?:  string[];
}

// ─── Envio do evento (Pixel + CAPI) ──────────────────────────────────────────

async function sendFbEvent(event_name: string, data: EventData = {}) {
  const event_id    = genEventId();
  const fbp         = getCookie('_fbp');
  const fbc         = getCookie('_fbc');
  const external_id = data.external_id || getOrCreateExternalId();

  const stored = typeof window !== 'undefined' ? window._fbUserData : undefined;
  const email  = data.email || stored?.em;
  const phone  = data.phone || stored?.ph;

  // Pixel (browser)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    const pixelData: Record<string, unknown> = {
      currency:     data.currency || DEFAULT_CURRENCY,
      content_type: data.content_type || 'product',
    };
    if (data.value        !== undefined) pixelData.value        = toPrice(data.value);
    if (data.contents)                   pixelData.contents     = data.contents;
    if (data.num_items    !== undefined) pixelData.num_items    = data.num_items;
    if (data.content_name)               pixelData.content_name = data.content_name;
    if (data.content_ids)                pixelData.content_ids  = data.content_ids;
    else if (data.contents)              pixelData.content_ids  = data.contents.map((c) => c.id);

    window.fbq('track', event_name, pixelData, { eventID: event_id });
  }

  // Conversions API (server-side via route handler)
  try {
    await fetch('/api/tracking/fbcapi', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name,
        event_id,
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        ...data,
        value: data.value !== undefined ? toPrice(data.value) : undefined,
        fbp,
        fbc,
        external_id,
        email,
        phone,
      }),
    });
  } catch {
    // falha silenciosa — não bloqueia a UX
  }
}

// ─── API Pública ──────────────────────────────────────────────────────────────

export const fbEvents = {
  viewContent(product: { id: string; name: string; value: number }) {
    return sendFbEvent('ViewContent', {
      value:        product.value,
      currency:     DEFAULT_CURRENCY,
      content_type: 'product',
      content_name: product.name,
      content_ids:  [product.id],
    });
  },

  addToCart(product: { id: string; name: string; value: number; quantity: number }) {
    return sendFbEvent('AddToCart', {
      value:        toPrice(product.value * product.quantity),
      currency:     DEFAULT_CURRENCY,
      content_type: 'product',
      content_name: product.name,
      contents:     [{ id: product.id, quantity: product.quantity, item_price: product.value }],
      num_items:    product.quantity,
    });
  },

  initiateCheckout(
    value:    number,
    contents: Array<{ id: string; quantity: number; item_price: number }>,
  ) {
    return sendFbEvent('InitiateCheckout', {
      value,
      currency:     DEFAULT_CURRENCY,
      content_type: 'product',
      contents,
      num_items:    contents.reduce((s, c) => s + c.quantity, 0),
    });
  },

  addPaymentInfo(value: number) {
    return sendFbEvent('AddPaymentInfo', {
      value,
      currency:     DEFAULT_CURRENCY,
      content_type: 'product',
    });
  },

  purchase(
    value:    number,
    contents: Array<{ id: string; quantity: number; item_price: number }>,
    userData: {
      email:        string;
      phone:        string;
      fn?:          string;
      ln?:          string;
      ct?:          string;
      st?:          string;
      zp?:          string;
      country?:     string;
      external_id?: string;
    },
  ) {
    return sendFbEvent('Purchase', {
      value,
      currency:     DEFAULT_CURRENCY,
      content_type: 'product',
      contents,
      num_items:    contents.reduce((s, c) => s + c.quantity, 0),
      ...userData,
    });
  },

  updateAdvancedMatching(email: string, phone: string): void {
    if (typeof window === 'undefined') return;
    const external_id = getOrCreateExternalId();
    window._fbUserData = {
      em: email.trim().toLowerCase(),
      ph: phone,
      external_id,
    };
    if (typeof window.fbq === 'function') {
      window.fbq('init', PIXEL_ID, {
        em:          email.trim().toLowerCase(),
        ph:          phone,
        external_id,
      });
    }
  },
};

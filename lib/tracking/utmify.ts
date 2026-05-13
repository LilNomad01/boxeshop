'use client';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UTMIFY — Rastreio de Pedidos
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * CONFIGURAÇÃO NO .env.local:
 *   UTMIFY_API_TOKEN=seu_token_utmify_aqui
 *
 * O envio é feito via POST /api/tracking/utmify (route handler server-side).
 */

// ─── Constantes — altere conforme o seu projeto ───────────────────────────────
const PLATFORM = 'EcomHub Store';
const COUNTRY  = 'IT';
const CURRENCY: UtmifyCurrency = 'EUR';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type UtmifyCurrency =
  | 'BRL' | 'USD' | 'EUR' | 'GBP' | 'ARS'
  | 'CAD' | 'COP' | 'MXN' | 'PYG' | 'CLP'
  | 'PEN' | 'PLN';

interface UtmifyCustomer {
  name:      string;
  email:     string;
  phone:     string | null;
  document:  string | null;
  country?:  string;
  ip?:       string;
}

interface UtmifyProduct {
  id:           string;
  name:         string;
  planId:       string | null;
  planName:     string | null;
  quantity:     number;
  priceInCents: number;
}

interface UtmifyTrackingParameters {
  src:          string | null;
  sck:          string | null;
  utm_source:   string | null;
  utm_campaign: string | null;
  utm_medium:   string | null;
  utm_content:  string | null;
  utm_term:     string | null;
}

interface UtmifyCommission {
  totalPriceInCents:     number;
  gatewayFeeInCents:     number;
  userCommissionInCents: number;
  currency?:             UtmifyCurrency;
}

interface UtmifyOrderPayload {
  orderId:             string;
  platform:            string;
  paymentMethod:       'credit_card' | 'boleto' | 'pix' | 'paypal' | 'free_price';
  status:              'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback';
  createdAt:           string;
  approvedDate:        string | null;
  refundedAt:          string | null;
  customer:            UtmifyCustomer;
  products:            UtmifyProduct[];
  trackingParameters:  UtmifyTrackingParameters;
  commission:          UtmifyCommission;
  isTest?:             boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((r) => r.startsWith(name + '='))
    ?.split('=')[1];
}

function getUtmParams(): UtmifyTrackingParameters {
  if (typeof window === 'undefined') {
    return {
      src: null, sck: null, utm_source: null, utm_campaign: null,
      utm_medium: null, utm_content: null, utm_term: null,
    };
  }
  try {
    const p = new URLSearchParams(window.location.search);
    return {
      src:          p.get('src')          || getCookie('utm_src')      || null,
      sck:          p.get('sck')          || getCookie('utm_sck')      || null,
      utm_source:   p.get('utm_source')   || getCookie('utm_source')   || null,
      utm_campaign: p.get('utm_campaign') || getCookie('utm_campaign') || null,
      utm_medium:   p.get('utm_medium')   || getCookie('utm_medium')   || null,
      utm_content:  p.get('utm_content')  || getCookie('utm_content')  || null,
      utm_term:     p.get('utm_term')     || getCookie('utm_term')     || null,
    };
  } catch {
    return {
      src: null, sck: null, utm_source: null, utm_campaign: null,
      utm_medium: null, utm_content: null, utm_term: null,
    };
  }
}

function toUTC(date: Date): string {
  const y  = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d  = String(date.getUTCDate()).padStart(2, '0');
  const h  = String(date.getUTCHours()).padStart(2, '0');
  const mi = String(date.getUTCMinutes()).padStart(2, '0');
  const s  = String(date.getUTCSeconds()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

async function sendUtmifyOrder(payload: UtmifyOrderPayload) {
  try {
    await fetch('/api/tracking/utmify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
  } catch (error) {
    console.error('[Utmify] Erro ao enviar pedido:', error);
  }
}

// ─── API Pública ──────────────────────────────────────────────────────────────

export const utmifyEvents = {
  purchase(
    orderId:    string,
    totalValue: number,
    products:   Array<{ id: string; name: string; quantity: number; price: number }>,
    customer:   { name: string; email: string; phone: string; document?: string; country?: string },
  ) {
    const now            = new Date();
    const totalInCents   = Math.round(totalValue * 100);

    const payload: UtmifyOrderPayload = {
      orderId,
      platform:      PLATFORM,
      paymentMethod: 'free_price',
      status:        'paid',
      createdAt:     toUTC(now),
      approvedDate:  toUTC(now),
      refundedAt:    null,
      customer: {
        name:     customer.name,
        email:    customer.email,
        phone:    customer.phone    || null,
        document: customer.document || null,
        country:  customer.country  || COUNTRY,
      },
      products: products.map((p) => ({
        id:           p.id,
        name:         p.name,
        planId:       null,
        planName:     null,
        quantity:     p.quantity,
        priceInCents: Math.round(p.price * 100),
      })),
      trackingParameters: getUtmParams(),
      commission: {
        totalPriceInCents:     totalInCents,
        gatewayFeeInCents:     0,
        userCommissionInCents: totalInCents,
        currency:              CURRENCY,
      },
      isTest: false,
    };

    return sendUtmifyOrder(payload);
  },
};

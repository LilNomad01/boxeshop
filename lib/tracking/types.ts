/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TRACKING TYPES — Tipos TypeScript para o sistema de tracking
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Facebook Events ──────────────────────────────────────────────────────────

export interface FBProduct {
  id: string;
  name: string;
  value: number;
}

export interface FBProductWithQuantity extends FBProduct {
  quantity: number;
}

export interface FBContent {
  id: string;
  quantity: number;
  item_price: number;
}

export interface FBUserData {
  email: string;
  phone: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string;
}

// ─── Utmify Events ────────────────────────────────────────────────────────────

export type UtmifyCurrency =
  | 'BRL' | 'USD' | 'EUR' | 'GBP' | 'ARS'
  | 'CAD' | 'COP' | 'MXN' | 'PYG' | 'CLP'
  | 'PEN' | 'PLN';

export type UtmifyPaymentMethod = 
  | 'credit_card' 
  | 'boleto' 
  | 'pix' 
  | 'paypal' 
  | 'free_price';

export type UtmifyOrderStatus = 
  | 'waiting_payment' 
  | 'paid' 
  | 'refused' 
  | 'refunded' 
  | 'chargedback';

export interface UtmifyProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface UtmifyCustomer {
  name: string;
  email: string;
  phone: string;
  document?: string;
  country?: string;
}

export interface UtmifyTrackingParameters {
  src: string | null;
  sck: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_medium: string | null;
  utm_content: string | null;
  utm_term: string | null;
}

// ─── Tracking Events ──────────────────────────────────────────────────────────

export type TrackingEventName =
  | 'ViewContent'
  | 'AddToCart'
  | 'InitiateCheckout'
  | 'AddPaymentInfo'
  | 'Purchase';

export interface TrackingEvent {
  name: TrackingEventName;
  timestamp: Date;
  data: Record<string, unknown>;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface FacebookAPIResponse {
  events_received?: number;
  messages?: string[];
  fbtrace_id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

export interface UtmifyAPIResponse {
  success?: boolean;
  message?: string;
  orderId?: string;
  error?: string;
}

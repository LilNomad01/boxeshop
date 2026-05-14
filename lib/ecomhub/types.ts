// Tipos da API EcomHub

export type EcomHubCountry = {
  id: number;
  name: string;
  acronym: string;
  currencies: { id: string; code: string } | null;
};

export type EcomHubStore = {
  id: string;
  myshopifyDomain: string | null;
};

export type EcomHubOrder = {
  id: string;
  price: number;
  status: string;
  date: string;
  shippingCountry_id: number;
  shippingZipCode: string;
  commissionCost: number;
  returnCommissionCost: number;
  mailCost: number;
  returnMailCost: number;
  paymentMethodCost: number;
  warehouseCost: number;
  warehouseReturnCost: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  updatedAt: string;
  orderItems: Array<{ id: string; quantity: number; price?: number }>;
};

export type EcomHubPaymentMethod =
  | "card" | "paypal" | "transfer" | "cod" | "financial" | "other";

export type EcomHubCreateOrderInput = {
  price: number;
  currency_code: string;
  paymentMethod: EcomHubPaymentMethod;
  external_id: string;
  shippingAddress: {
    countryCode: string;
    province: string | null;
    address1: string;
    address2?: string;
    postalCode: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    email?: string | null;
    companyName?: string;
    company_id?: string;
    country_id: number;
    city: string;
  };
  lineItems: Array<{ id: string; quantity: number }>;
};

export type EcomHubCreateOrderResponse =
  | { id: string }
  | { error: { code: string; context: string } };

export type EcomHubResult<T> =
  | { ok: true; data: T; durationMs: number; httpStatus: number }
  | { ok: false; error: { code: string; context: string }; durationMs: number; httpStatus: number };

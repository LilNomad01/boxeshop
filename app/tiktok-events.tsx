"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    ttq?: any;
  }
}

const PRODUCT_ID = "jbl-boombox-bluetooth";
const PRODUCT_NAME = "JBL Boombox Bluetooth";
const PRICE = 750;
const CURRENCY = "RON";

function fireWhenReady(fn: () => void, attempts = 20) {
  if (typeof window === "undefined") return;
  if (window.ttq && typeof window.ttq.track === "function") {
    fn();
  } else if (attempts > 0) {
    setTimeout(() => fireWhenReady(fn, attempts - 1), 250);
  }
}

// SHA-256 hash (necessário para Advanced Matching do TikTok)
async function sha256(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Normaliza telefone romeno: 0721234567 -> +40721234567
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("40")) return "+" + digits;
  if (digits.startsWith("0")) return "+40" + digits.slice(1);
  return "+40" + digits;
}

export function TrackViewContent() {
  useEffect(() => {
    fireWhenReady(() => {
      window.ttq.track("ViewContent", {
        contents: [{ content_id: PRODUCT_ID, content_type: "product", content_name: PRODUCT_NAME, quantity: 1, price: PRICE }],
        value: PRICE,
        currency: CURRENCY,
      });
    });
  }, []);
  return null;
}

export function TrackInitiateCheckout() {
  useEffect(() => {
    fireWhenReady(() => {
      window.ttq.track("InitiateCheckout", {
        contents: [{ content_id: PRODUCT_ID, content_type: "product", content_name: PRODUCT_NAME, quantity: 1, price: PRICE }],
        value: PRICE,
        currency: CURRENCY,
      });
    });
  }, []);
  return null;
}

export function TrackPlaceAnOrder({ orderId }: { orderId?: string }) {
  useEffect(() => {
    (async () => {
      // Tenta ler telefone salvo no checkout
      let phoneHash: string | undefined;
      try {
        const phone = sessionStorage.getItem("ck_phone");
        if (phone) {
          phoneHash = await sha256(normalizePhone(phone));
          sessionStorage.removeItem("ck_phone");
        }
      } catch {}

      fireWhenReady(() => {
        // Identify primeiro (Advanced Matching) — só envia se tiver hash
        if (phoneHash && window.ttq.identify) {
          window.ttq.identify({ phone_number: phoneHash });
        }
        // Depois o evento de conversão
        window.ttq.track("PlaceAnOrder", {
          contents: [{ content_id: PRODUCT_ID, content_type: "product", content_name: PRODUCT_NAME, quantity: 1, price: PRICE }],
          value: PRICE,
          currency: CURRENCY,
          order_id: orderId,
        });
      });
    })();
  }, [orderId]);
  return null;
}

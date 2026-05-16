"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    ttq?: any;
  }
}

const PRODUCT_ID = "jbl-boombox-bluetooth";
const PRODUCT_NAME = "JBL Boombox Bluetooth";
const PRICE = 349;
const CURRENCY = "RON";

function fireWhenReady(fn: () => void, attempts = 20) {
  if (typeof window === "undefined") return;
  if (window.ttq && typeof window.ttq.track === "function") {
    fn();
  } else if (attempts > 0) {
    setTimeout(() => fireWhenReady(fn, attempts - 1), 250);
  }
}

export function TrackViewContent() {
  useEffect(() => {
    fireWhenReady(() => {
      window.ttq.track("ViewContent", {
        content_id: PRODUCT_ID,
        content_type: "product",
        content_name: PRODUCT_NAME,
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
        content_id: PRODUCT_ID,
        content_type: "product",
        content_name: PRODUCT_NAME,
        value: PRICE,
        currency: CURRENCY,
      });
    });
  }, []);
  return null;
}

export function TrackPlaceAnOrder({ orderId }: { orderId?: string }) {
  useEffect(() => {
    fireWhenReady(() => {
      window.ttq.track("PlaceAnOrder", {
        content_id: PRODUCT_ID,
        content_type: "product",
        content_name: PRODUCT_NAME,
        value: PRICE,
        currency: CURRENCY,
        order_id: orderId,
      });
    });
  }, [orderId]);
  return null;
}

"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * TrackViewContent — Componente de rastreio de visualização de produto
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Coloque este componente dentro da página do produto (Server Component):
 *
 *   import { TrackViewContent } from "@/components/tracking/TrackViewContent";
 *   // ...
 *   <TrackViewContent productId={product.id} productName={product.name} productPrice={product.price} />
 *
 * Dispara automaticamente os eventos ViewContent no Facebook Pixel e CAPI.
 */

import { useEffect } from "react";
import { fbEvents } from "@/lib/tracking/fbevents";

interface Props {
  productId:    string;
  productName:  string;
  productPrice: number;
}

export function TrackViewContent({ productId, productName, productPrice }: Props) {
  useEffect(() => {
    fbEvents.viewContent({ id: productId, name: productName, value: productPrice });
  }, [productId, productName, productPrice]);

  return null;
}

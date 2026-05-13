# Exemplo de Integração do Tracking

Este documento mostra como integrar o sistema de tracking no checkout existente do projeto.

## 📋 Checklist de Integração

- [ ] Adicionar variáveis de ambiente no `.env.local`
- [ ] Instalar Facebook Pixel no `app/layout.tsx`
- [ ] Adicionar tracking de ViewContent na página inicial
- [ ] Adicionar tracking de AddToCart no botão de compra
- [ ] Adicionar tracking de InitiateCheckout no formulário de checkout
- [ ] Adicionar tracking de Purchase após criação do pedido
- [ ] Testar todos os eventos no Facebook Events Manager
- [ ] Verificar pedidos no dashboard da Utmify

## 🔧 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` e adicione:

```env
# Facebook Tracking
NEXT_PUBLIC_FB_PIXEL_ID=seu_pixel_id_aqui
FB_ACCESS_TOKEN=seu_access_token_aqui

# Utmify Tracking
UTMIFY_API_TOKEN=seu_token_utmify_aqui
```

### 2. Instalar Facebook Pixel no Layout

Edite `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

  return (
    <html lang="pt">
      <head>
        {pixelId && (
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 3. Adicionar ViewContent na Página Inicial

Edite `app/(storefront)/page.tsx`:

```tsx
import { TrackViewContent } from "@/components/tracking/TrackViewContent";

export default function HomePage() {
  // Dados do produto principal
  const product = {
    id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
    name: "JBL Clip 5 - Caixa de Som Bluetooth",
    price: 49.99
  };

  return (
    <div>
      <TrackViewContent 
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
      />
      
      {/* Resto do conteúdo da página */}
    </div>
  );
}
```

### 4. Adicionar AddToCart no Botão de Compra

Crie um componente client-side para o botão:

```tsx
// components/BuyButton.tsx
'use client';

import { fbEvents } from '@/lib/tracking';
import { Button } from '@/components/ui/button';

interface BuyButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  onBuyClick: () => void;
}

export function BuyButton({ 
  productId, 
  productName, 
  productPrice,
  onBuyClick 
}: BuyButtonProps) {
  const handleClick = () => {
    // Disparar evento AddToCart
    fbEvents.addToCart({
      id: productId,
      name: productName,
      value: productPrice,
      quantity: 1
    });

    // Executar ação de compra
    onBuyClick();
  };

  return (
    <Button onClick={handleClick} size="lg">
      Comprar Agora
    </Button>
  );
}
```

Use no componente da página:

```tsx
import { BuyButton } from '@/components/BuyButton';

export default function HomePage() {
  const product = {
    id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
    name: "JBL Clip 5",
    price: 49.99
  };

  const handleBuy = () => {
    window.location.href = '/checkout';
  };

  return (
    <div>
      <BuyButton
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
        onBuyClick={handleBuy}
      />
    </div>
  );
}
```

### 5. Adicionar Tracking no Checkout

Edite `app/(storefront)/checkout/checkout-form.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { fbEvents, utmifyEvents } from '@/lib/tracking';

export function CheckoutForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // ... outros campos
  });

  // Produto sendo comprado
  const product = {
    id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
    name: "JBL Clip 5",
    price: 49.99,
    quantity: 1
  };

  // Disparar InitiateCheckout quando o formulário carrega
  useEffect(() => {
    fbEvents.initiateCheckout(
      product.price,
      [{
        id: product.id,
        quantity: product.quantity,
        item_price: product.price
      }]
    );
  }, []);

  // Atualizar Advanced Matching quando email e telefone são preenchidos
  useEffect(() => {
    if (formData.email && formData.phone) {
      fbEvents.updateAdvancedMatching(formData.email, formData.phone);
    }
  }, [formData.email, formData.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Disparar AddPaymentInfo
    await fbEvents.addPaymentInfo(product.price);

    // Criar pedido na EcomHub
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        productId: product.id,
        quantity: product.quantity,
        price: product.price
      })
    });

    const result = await response.json();

    if (result.success && result.orderId) {
      // Disparar eventos de Purchase
      await fbEvents.purchase(
        product.price,
        [{
          id: product.id,
          quantity: product.quantity,
          item_price: product.price
        }],
        {
          email: formData.email,
          phone: formData.phone,
          fn: formData.firstName,
          ln: formData.lastName,
          external_id: result.orderId
        }
      );

      await utmifyEvents.purchase(
        result.orderId,
        product.price,
        [{
          id: product.id,
          name: product.name,
          quantity: product.quantity,
          price: product.price
        }],
        {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone
        }
      );

      // Redirecionar para página de sucesso
      window.location.href = `/success?order=${result.orderId}`;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos do formulário */}
    </form>
  );
}
```

### 6. Atualizar a API de Checkout

Edite `app/api/checkout/route.ts` para incluir a criação do pedido na EcomHub:

```tsx
import { NextRequest, NextResponse } from 'next/server';
import { createEcomHubOrder } from '@/lib/ecomhub/client';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Criar pedido na EcomHub
  const orderResult = await createEcomHubOrder({
    price: body.price,
    currency_code: "EUR",
    paymentMethod: "cod",
    external_id: `ORDER-${Date.now()}`,
    shippingAddress: {
      countryCode: body.country || "IT",
      country_id: 86, // IT
      firstName: body.firstName,
      lastName: body.lastName,
      address1: body.address,
      city: body.city,
      postalCode: body.postalCode,
      province: body.province || null,
      phone: body.phone,
      email: body.email,
    },
    lineItems: [{
      id: body.productId,
      quantity: body.quantity
    }]
  });

  if (orderResult.ok) {
    return NextResponse.json({
      success: true,
      orderId: orderResult.data.id
    });
  } else {
    return NextResponse.json({
      success: false,
      error: orderResult.error
    }, { status: 400 });
  }
}
```

## 🧪 Testando a Integração

### 1. Testar Facebook Pixel

1. Instale a extensão [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
2. Navegue pelo site
3. Verifique se os eventos aparecem na extensão

### 2. Testar Conversions API

1. Acesse [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Vá para "Test Events"
3. Adicione `FB_TEST_EVENT_CODE=TEST12345` no `.env.local`
4. Execute os eventos e veja-os aparecer em tempo real

### 3. Testar Utmify

1. Faça um pedido de teste
2. Acesse o dashboard da Utmify
3. Verifique se o pedido aparece na lista

## 🐛 Troubleshooting

### Eventos não aparecem no Facebook

- Verifique se `NEXT_PUBLIC_FB_PIXEL_ID` está configurado
- Verifique se o script do Pixel está carregando (use Facebook Pixel Helper)
- Verifique o console do browser para erros

### Conversions API não funciona

- Verifique se `FB_ACCESS_TOKEN` está configurado corretamente
- Verifique os logs da API em `/api/tracking/fbcapi`
- Teste com `FB_TEST_EVENT_CODE` no Events Manager

### Utmify não recebe pedidos

- Verifique se `UTMIFY_API_TOKEN` está configurado
- Verifique os logs da API em `/api/tracking/utmify`
- Verifique se o formato do payload está correto

## 📚 Próximos Passos

1. Implementar tracking de eventos adicionais (Lead, CompleteRegistration, etc.)
2. Adicionar tracking de produtos relacionados
3. Implementar tracking de abandono de carrinho
4. Configurar públicos personalizados no Facebook
5. Criar relatórios de conversão no Utmify

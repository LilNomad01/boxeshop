# Sistema de Tracking — EcomHub Store

Este documento descreve a estrutura completa de tracking implementada no projeto, incluindo Facebook Pixel, Conversions API e Utmify.

## 📁 Estrutura de Arquivos

```
lib/tracking/
  ├── fbevents.ts       → Facebook Pixel + Conversions API (client-side)
  ├── utmify.ts         → Utmify tracking (client-side)
  └── index.ts          → Exportações centralizadas

app/api/tracking/
  ├── fbcapi/route.ts   → Facebook Conversions API (server-side)
  └── utmify/route.ts   → Utmify API (server-side)

components/tracking/
  └── TrackViewContent.tsx → Componente de exemplo para ViewContent
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis ao seu `.env.local`:

```env
# ─── Facebook ─────────────────────────────────────────────────────────────────
NEXT_PUBLIC_FB_PIXEL_ID=seu_pixel_id_aqui
FB_ACCESS_TOKEN=seu_access_token_conversions_api_aqui
# FB_TEST_EVENT_CODE=TEST12345   # descomente para testar no Events Manager

# ─── Utmify ───────────────────────────────────────────────────────────────────
UTMIFY_API_TOKEN=seu_token_utmify_aqui
```

### 2. Instalar o Facebook Pixel

Adicione o script do Facebook Pixel no seu `app/layout.tsx`:

```tsx
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <head>
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
            fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 📊 Eventos de Tracking

### Fluxo Completo de Eventos

| Momento | Evento | Função |
|---------|--------|--------|
| Página do produto carrega | ViewContent | `fbEvents.viewContent(...)` |
| Usuário clica "Adicionar ao carrinho" | AddToCart | `fbEvents.addToCart(...)` |
| Checkout abre | InitiateCheckout | `fbEvents.initiateCheckout(...)` |
| Usuário preenche dados de pagamento | AddPaymentInfo | `fbEvents.addPaymentInfo(...)` |
| Pedido criado com sucesso | Purchase | `fbEvents.purchase(...)` + `utmifyEvents.purchase(...)` |

## 🔧 Como Usar

### 1. ViewContent (Visualização de Produto)

**Opção A: Usando o componente**

```tsx
import { TrackViewContent } from "@/components/tracking/TrackViewContent";

export default function ProductPage() {
  const product = {
    id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
    name: "JBL Clip 5",
    price: 49.99
  };

  return (
    <div>
      <TrackViewContent 
        productId={product.id}
        productName={product.name}
        productPrice={product.price}
      />
      {/* resto da página */}
    </div>
  );
}
```

**Opção B: Chamada direta**

```tsx
'use client';
import { useEffect } from 'react';
import { fbEvents } from '@/lib/tracking';

export default function ProductPage() {
  useEffect(() => {
    fbEvents.viewContent({
      id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
      name: "JBL Clip 5",
      value: 49.99
    });
  }, []);

  return <div>...</div>;
}
```

### 2. AddToCart (Adicionar ao Carrinho)

```tsx
'use client';
import { fbEvents } from '@/lib/tracking';

function handleAddToCart() {
  fbEvents.addToCart({
    id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
    name: "JBL Clip 5",
    value: 49.99,
    quantity: 1
  });
  
  // adicionar ao carrinho...
}
```

### 3. InitiateCheckout (Iniciar Checkout)

```tsx
'use client';
import { fbEvents } from '@/lib/tracking';

function handleCheckout() {
  const cartItems = [
    { id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075", quantity: 1, item_price: 49.99 }
  ];
  
  const total = cartItems.reduce((sum, item) => sum + (item.quantity * item.item_price), 0);
  
  fbEvents.initiateCheckout(total, cartItems);
  
  // redirecionar para checkout...
}
```

### 4. AddPaymentInfo (Adicionar Informações de Pagamento)

```tsx
'use client';
import { fbEvents } from '@/lib/tracking';

function handlePaymentInfo(total: number) {
  fbEvents.addPaymentInfo(total);
}
```

### 5. Purchase (Compra Concluída)

```tsx
'use client';
import { fbEvents, utmifyEvents } from '@/lib/tracking';

async function handlePurchaseSuccess(orderId: string, orderData: any) {
  const contents = [
    { 
      id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075", 
      quantity: 1, 
      item_price: 49.99 
    }
  ];
  
  const total = 49.99;
  
  // Facebook Purchase Event
  await fbEvents.purchase(
    total,
    contents,
    {
      email: orderData.email,
      phone: orderData.phone,
      fn: orderData.firstName,
      ln: orderData.lastName,
      ct: orderData.city,
      zp: orderData.postalCode,
      country: orderData.countryCode,
      external_id: orderId
    }
  );
  
  // Utmify Purchase Event
  await utmifyEvents.purchase(
    orderId,
    total,
    [
      {
        id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075",
        name: "JBL Clip 5",
        quantity: 1,
        price: 49.99
      }
    ],
    {
      name: `${orderData.firstName} ${orderData.lastName}`,
      email: orderData.email,
      phone: orderData.phone,
      document: orderData.document,
      country: orderData.countryCode
    }
  );
}
```

### 6. Advanced Matching (Atualizar Dados do Usuário)

```tsx
'use client';
import { fbEvents } from '@/lib/tracking';

function handleUserDataUpdate(email: string, phone: string) {
  fbEvents.updateAdvancedMatching(email, phone);
}
```

## 🎯 Exemplo Completo: Integração no Checkout

```tsx
'use client';
import { useState } from 'react';
import { fbEvents, utmifyEvents } from '@/lib/tracking';
import { createEcomHubOrder } from '@/lib/ecomhub/client';

export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'IT'
  });

  const cartItems = [
    { 
      id: "V:135112dd-1164-4a5f-9c7a-8bec5c4e7075", 
      name: "JBL Clip 5",
      quantity: 1, 
      price: 49.99 
    }
  ];

  const total = 49.99;

  // Disparar InitiateCheckout quando o formulário é exibido
  useEffect(() => {
    fbEvents.initiateCheckout(
      total,
      cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        item_price: item.price
      }))
    );
  }, []);

  // Disparar AddPaymentInfo quando o usuário preenche os dados
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Atualizar Advanced Matching quando email e telefone estiverem preenchidos
    if (formData.email && formData.phone) {
      fbEvents.updateAdvancedMatching(formData.email, formData.phone);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Disparar AddPaymentInfo
    fbEvents.addPaymentInfo(total);

    // Criar pedido na EcomHub
    const orderResult = await createEcomHubOrder({
      price: total,
      currency_code: "EUR",
      paymentMethod: "cod",
      external_id: `ORDER-${Date.now()}`,
      shippingAddress: {
        countryCode: formData.country,
        country_id: 86, // IT
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        province: null,
        phone: formData.phone,
        email: formData.email,
      },
      lineItems: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }))
    });

    if (orderResult.ok) {
      const orderId = orderResult.data.id;

      // Disparar Purchase Events
      await fbEvents.purchase(
        total,
        cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          item_price: item.price
        })),
        {
          email: formData.email,
          phone: formData.phone,
          fn: formData.firstName,
          ln: formData.lastName,
          ct: formData.city,
          zp: formData.postalCode,
          country: formData.country,
          external_id: orderId
        }
      );

      await utmifyEvents.purchase(
        orderId,
        total,
        cartItems,
        {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          country: formData.country
        }
      );

      // Redirecionar para página de sucesso
      window.location.href = `/success?order=${orderId}`;
    } else {
      console.error('Erro ao criar pedido:', orderResult.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* campos do formulário */}
    </form>
  );
}
```

## 🔍 Deduplicação de Eventos

O sistema garante que eventos não sejam duplicados entre o Facebook Pixel (browser) e a Conversions API (server-side) através do campo `event_id`, que é único para cada evento.

## 🧪 Testando

### Facebook Events Manager

1. Acesse o [Facebook Events Manager](https://business.facebook.com/events_manager2)
2. Selecione seu Pixel
3. Vá para "Test Events"
4. Adicione `FB_TEST_EVENT_CODE` no `.env.local`
5. Execute os eventos e veja-os aparecer em tempo real

### Utmify

1. Acesse o dashboard da Utmify
2. Vá para "Pedidos"
3. Verifique se os pedidos estão sendo registrados corretamente

## 📝 Notas Importantes

- **Segurança**: O `FB_ACCESS_TOKEN` e `UTMIFY_API_TOKEN` são server-side e nunca expostos ao browser
- **Fallback**: Se os tokens não estiverem configurados, os eventos são ignorados silenciosamente (não quebram o checkout)
- **Cookies**: O sistema usa cookies para rastrear UTM parameters e external_id do usuário
- **Privacy**: Todos os dados pessoais enviados para o Facebook são hasheados com SHA-256

## 🔗 Recursos

- [Facebook Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Facebook Pixel](https://developers.facebook.com/docs/meta-pixel)
- [Utmify API](https://utmify.com.br/docs)
- [EcomHub API](https://api.ecomhub.app/docs)

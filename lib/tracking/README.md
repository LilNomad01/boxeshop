# Biblioteca de Tracking

Esta pasta contém os módulos de tracking para Facebook Pixel, Conversions API e Utmify.

## 📦 Módulos

### `fbevents.ts`
Cliente para Facebook Pixel e Conversions API (CAPI).

**Eventos disponíveis:**
- `viewContent()` - Visualização de produto
- `addToCart()` - Adicionar ao carrinho
- `initiateCheckout()` - Iniciar checkout
- `addPaymentInfo()` - Adicionar informações de pagamento
- `purchase()` - Compra concluída
- `updateAdvancedMatching()` - Atualizar dados do usuário

### `utmify.ts`
Cliente para rastreamento de pedidos na Utmify.

**Eventos disponíveis:**
- `purchase()` - Registrar compra na Utmify

### `index.ts`
Exportações centralizadas para facilitar imports.

## 🚀 Uso Rápido

```tsx
import { fbEvents, utmifyEvents } from '@/lib/tracking';

// ViewContent
fbEvents.viewContent({
  id: "produto-123",
  name: "Produto Exemplo",
  value: 99.99
});

// Purchase
fbEvents.purchase(99.99, contents, userData);
utmifyEvents.purchase(orderId, 99.99, products, customer);
```

## 📖 Documentação Completa

Veja a documentação completa em `/docs/TRACKING.md`

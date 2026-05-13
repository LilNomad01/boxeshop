/**
 * Script de teste para o sistema de tracking
 * Envia um evento de teste para as APIs de tracking
 */

const testFacebookEvent = async () => {
  console.log('\n🔵 Testando Facebook Conversions API...\n');
  
  const eventData = {
    event_name: 'ViewContent',
    event_id: `test-${Date.now()}`,
    event_source_url: 'http://localhost:3001/test',
    value: 49.99,
    currency: 'EUR',
    content_type: 'product',
    content_name: 'JBL Clip 5 - Teste',
    content_ids: ['test-product-123'],
    contents: [
      { id: 'test-product-123', quantity: 1, item_price: 49.99 }
    ],
    email: 'test@example.com',
    phone: '+351912345678',
    fn: 'Test',
    ln: 'User',
    external_id: 'test-external-id-123'
  };

  try {
    const response = await fetch('http://localhost:3001/api/tracking/fbcapi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Test Script)',
        'X-Forwarded-For': '127.0.0.1'
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(result, null, 2));
    
    if (result.status === 'skipped') {
      console.log('\n⚠️  Facebook: Token não configurado (esperado se FB_ACCESS_TOKEN não estiver no .env.local)');
    } else if (result.events_received) {
      console.log('\n✅ Facebook: Evento enviado com sucesso!');
      console.log(`   Eventos recebidos: ${result.events_received}`);
      if (result.fbtrace_id) {
        console.log(`   Trace ID: ${result.fbtrace_id}`);
      }
    } else if (result.error) {
      console.log('\n❌ Facebook: Erro ao enviar evento');
      console.log(`   ${result.error.message || result.error}`);
    }
  } catch (error) {
    console.log('\n❌ Erro na requisição:', error.message);
  }
};

const testUtmifyEvent = async () => {
  console.log('\n🟢 Testando Utmify API...\n');
  
  const eventData = {
    orderId: `TEST-ORDER-${Date.now()}`,
    platform: 'EcomHub Store',
    paymentMethod: 'free_price',
    status: 'paid',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    approvedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
    refundedAt: null,
    customer: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '+351912345678',
      document: null,
      country: 'IT'
    },
    products: [
      {
        id: 'test-product-123',
        name: 'JBL Clip 5 - Teste',
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: 4999
      }
    ],
    trackingParameters: {
      src: 'test',
      sck: 'test-campaign',
      utm_source: 'test',
      utm_campaign: 'test-campaign',
      utm_medium: 'test',
      utm_content: null,
      utm_term: null
    },
    commission: {
      totalPriceInCents: 4999,
      gatewayFeeInCents: 0,
      userCommissionInCents: 4999,
      currency: 'EUR'
    },
    isTest: true
  };

  try {
    const response = await fetch('http://localhost:3001/api/tracking/utmify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();
    
    console.log('📊 Status:', response.status);
    console.log('📦 Resposta:', JSON.stringify(result, null, 2));
    
    if (result.status === 'skipped') {
      console.log('\n⚠️  Utmify: Token não configurado (esperado se UTMIFY_API_TOKEN não estiver no .env.local)');
    } else if (result.success) {
      console.log('\n✅ Utmify: Evento enviado com sucesso!');
    } else if (result.error) {
      console.log('\n❌ Utmify: Erro ao enviar evento');
      console.log(`   ${result.error}`);
    }
  } catch (error) {
    console.log('\n❌ Erro na requisição:', error.message);
  }
};

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║           🧪 TESTE DO SISTEMA DE TRACKING                   ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  await testFacebookEvent();
  await testUtmifyEvent();
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ TESTES CONCLUÍDOS                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log('📝 Notas:');
  console.log('   • Se os tokens não estiverem configurados, as APIs retornam "skipped"');
  console.log('   • Isso é esperado e não quebra o sistema');
  console.log('   • Configure os tokens no .env.local para ativar o tracking\n');
};

runTests();

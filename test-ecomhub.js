/**
 * Script de teste para a API da EcomHub
 */

const testEcomHubConnection = async () => {
  console.log('\n🔵 Testando conexão com EcomHub API...\n');
  
  const token = 'd51e4773-856c-4549-bd56-996067f48fac';
  const secret = 'secret_91374a346de544989e99ae57183ea9e9';
  
  try {
    // Teste 1: Buscar informações da loja
    console.log('📊 Teste 1: Buscar informações da loja');
    const storeResponse = await fetch(`https://api.ecomhub.app/apps/stores?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Secret': secret
      }
    });
    
    const storeData = await storeResponse.json();
    console.log('   Status:', storeResponse.status);
    console.log('   Resposta:', JSON.stringify(storeData, null, 2));
    
    if (storeResponse.ok) {
      console.log('   ✅ Loja encontrada! ID:', storeData.id);
    }
    
    // Teste 2: Buscar países disponíveis
    console.log('\n📊 Teste 2: Buscar países disponíveis');
    const countriesResponse = await fetch(`https://api.ecomhub.app/apps/countries?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Secret': secret
      }
    });
    
    const countriesData = await countriesResponse.json();
    console.log('   Status:', countriesResponse.status);
    
    if (countriesResponse.ok && Array.isArray(countriesData)) {
      console.log(`   ✅ ${countriesData.length} países encontrados`);
      
      // Mostrar alguns países
      const italy = countriesData.find(c => c.acronym === 'IT');
      if (italy) {
        console.log(`   🇮🇹 Itália: ID ${italy.id}, Moeda: ${italy.currencies?.code || 'N/A'}`);
      }
      
      const portugal = countriesData.find(c => c.acronym === 'PT');
      if (portugal) {
        console.log(`   🇵🇹 Portugal: ID ${portugal.id}, Moeda: ${portugal.currencies?.code || 'N/A'}`);
      }
      
      const brazil = countriesData.find(c => c.acronym === 'BR');
      if (brazil) {
        console.log(`   🇧🇷 Brasil: ID ${brazil.id}, Moeda: ${brazil.currencies?.code || 'N/A'}`);
      }
    }
    
    // Teste 3: Buscar pedidos
    console.log('\n📊 Teste 3: Buscar pedidos recentes');
    const ordersResponse = await fetch(`https://api.ecomhub.app/apps/orders?token=${token}&orderBy=date&skip=0`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Secret': secret
      }
    });
    
    const ordersData = await ordersResponse.json();
    console.log('   Status:', ordersResponse.status);
    
    if (ordersResponse.ok && Array.isArray(ordersData)) {
      console.log(`   ✅ ${ordersData.length} pedidos encontrados`);
      
      if (ordersData.length > 0) {
        const lastOrder = ordersData[0];
        console.log(`   📦 Último pedido: ${lastOrder.id}`);
        console.log(`      Cliente: ${lastOrder.customerName}`);
        console.log(`      Valor: ${lastOrder.price} ${lastOrder.currency_code || 'EUR'}`);
        console.log(`      Status: ${lastOrder.status}`);
        console.log(`      Data: ${lastOrder.date}`);
      }
    }
    
  } catch (error) {
    console.log('\n❌ Erro:', error.message);
  }
};

const runTests = async () => {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║              🧪 TESTE DA API ECOMHUB                         ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  
  await testEcomHubConnection();
  
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ TESTES CONCLUÍDOS                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
};

runTests();

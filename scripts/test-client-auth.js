/**
 * Teste específico de autenticação de cliente
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testClientAuth() {
  console.log('🧪 Testando Autenticação de Cliente\n');

  try {
    // 1. Testar login
    console.log('1️⃣  Testando login...');
    const loginResponse = await fetch(`${BASE_URL}/api/cliente/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: '12345678909',
        senha: '123456',
      }),
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.json();
      console.error('❌ Erro no login:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log('   Cliente:', loginData.cliente?.nome);
    console.log('   Cookies recebidos:', loginResponse.headers.get('set-cookie') ? 'Sim' : 'Não');

    // 2. Testar sessão (com cookies)
    console.log('\n2️⃣  Testando sessão...');

    // Extrair cookies da resposta
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('   Cookies:', cookies || 'Nenhum cookie recebido');

    const sessionResponse = await fetch(`${BASE_URL}/api/cliente/session`, {
      method: 'GET',
      headers: {
        Cookie: cookies || '',
      },
    });

    if (sessionResponse.ok) {
      const sessionData = await sessionResponse.json();
      if (sessionData.cliente) {
        console.log('✅ Sessão válida');
        console.log('   Cliente:', sessionData.cliente.nome);
      } else {
        console.log('⚠️  Sessão retornou vazia');
      }
    } else {
      const error = await sessionResponse.json();
      console.error('❌ Erro na sessão:', error);
    }

    // 3. Testar logout
    console.log('\n3️⃣  Testando logout...');
    const logoutResponse = await fetch(`${BASE_URL}/api/cliente/logout`, {
      method: 'POST',
      headers: {
        Cookie: cookies || '',
      },
    });

    if (logoutResponse.ok) {
      console.log('✅ Logout realizado com sucesso');
    } else {
      console.error('❌ Erro no logout');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testClientAuth();


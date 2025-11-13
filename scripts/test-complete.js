/**
 * Script completo de testes do sistema
 * Testa MongoDB, Firebase, API routes e funcionalidades principais
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logTest(name, status, details = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  log(`${icon} ${name}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

async function testMongoConnection() {
  logSection('1. Teste de Conexão MongoDB');

  try {
    const response = await fetch(`${BASE_URL}/api/seed/clear`, {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      logTest('Conexão MongoDB', 'pass', `Conectado com sucesso`);
      return true;
    } else {
      logTest('Conexão MongoDB', 'fail', `Erro HTTP: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Conexão MongoDB', 'fail', error.message);
    return false;
  }
}

async function testSeeds() {
  logSection('2. Teste de Seeds');

  try {
    log('Executando seed completo...', 'blue');
    const response = await fetch(`${BASE_URL}/api/seed/all`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logTest('Seed Completo', 'fail', `Erro HTTP ${response.status}: ${errorText}`);
      return false;
    }

    const data = await response.json();

    if (data.success) {
      logTest('Seed Completo', 'pass', 'Executado com sucesso');

      // MongoDB
      const mongodb = data.summary.mongodb;
      log('\n📊 MongoDB:', 'blue');
      logTest(
        '  Empreendimentos',
        mongodb.empreendimentos > 0 ? 'pass' : 'fail',
        `${mongodb.empreendimentos} documentos`,
      );
      logTest(
        '  Clientes SGCI',
        mongodb.clientesSGCI > 0 ? 'pass' : 'fail',
        `${mongodb.clientesSGCI} documentos`,
      );
      logTest(
        '  Negociações',
        mongodb.negociacoes > 0 ? 'pass' : 'fail',
        `${mongodb.negociacoes} documentos`,
      );
      logTest(
        '  Corretores',
        mongodb.corretores > 0 ? 'pass' : 'fail',
        `${mongodb.corretores} documentos`,
      );
      logTest('  Recibos', mongodb.recibos > 0 ? 'pass' : 'fail', `${mongodb.recibos} documentos`);
      logTest(
        '  Clientes Auth',
        mongodb.clientesAuth > 0 ? 'pass' : 'fail',
        `${mongodb.clientesAuth} documentos`,
      );

      // Firebase
      const firebase = data.summary.firebase;
      log('\n🔥 Firebase:', 'blue');
      if (firebase.errors === 0 && firebase.usuariosCriados > 0) {
        logTest('  Usuários Criados', 'pass', `${firebase.usuariosCriados} usuários`);
        logTest('  Erros', 'pass', 'Nenhum erro');
      } else if (firebase.errors > 0) {
        logTest('  Usuários Criados', 'fail', `${firebase.usuariosCriados} usuários criados`);
        logTest('  Erros', 'fail', `${firebase.errors} erros encontrados`);
        log('  ⚠️  Verifique se o servidor foi reiniciado após configurar Firebase', 'yellow');
      } else {
        logTest('  Firebase', 'fail', 'Nenhum usuário criado');
      }

      return true;
    } else {
      logTest('Seed Completo', 'fail', data.error || 'Erro desconhecido');
      return false;
    }
  } catch (error) {
    logTest('Seed Completo', 'fail', error.message);
    return false;
  }
}

async function testClientAuth() {
  logSection('3. Teste de Autenticação de Cliente');

  try {
    // Testar login com credencial de teste
    const loginResponse = await fetch(`${BASE_URL}/api/cliente/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cpf: '12345678909',
        senha: '123456',
      }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      logTest('Login Cliente', 'pass', `Cliente autenticado: ${loginData.cliente?.nome}`);

      // Testar sessão
      const sessionResponse = await fetch(`${BASE_URL}/api/cliente/session`);
      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData.cliente) {
          logTest('Sessão Cliente', 'pass', 'Sessão válida');
        } else {
          logTest('Sessão Cliente', 'fail', 'Sessão não encontrada (cookie não persistiu)');
        }
      }

      return true;
    } else {
      const errorData = await loginResponse.json();
      logTest('Login Cliente', 'fail', errorData.error || 'Erro ao fazer login');
      return false;
    }
  } catch (error) {
    logTest('Autenticação Cliente', 'fail', error.message);
    return false;
  }
}

async function testFirebaseAuth() {
  logSection('4. Teste de Autenticação Firebase');

  try {
    const response = await fetch(`${BASE_URL}/api/auth/session`);

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        logTest('Sessão Firebase', 'pass', `Usuário: ${data.user.email}`);
      } else {
        logTest('Sessão Firebase', 'pass', 'Nenhuma sessão ativa (esperado se não logado)');
      }
      return true;
    } else {
      logTest('Sessão Firebase', 'fail', `Erro HTTP: ${response.status}`);
      return false;
    }
  } catch (error) {
    logTest('Autenticação Firebase', 'fail', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  logSection('5. Teste de API Endpoints');

  const endpoints = [
    { name: 'GET /api/sgci/state', method: 'GET', path: '/api/sgci/state' },
    { name: 'GET /api/cliente/session', method: 'GET', path: '/api/cliente/session' },
    { name: 'GET /api/auth/session', method: 'GET', path: '/api/auth/session' },
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
      });

      if (response.ok || response.status === 200) {
        logTest(endpoint.name, 'pass', `Status: ${response.status}`);
        passed++;
      } else {
        logTest(endpoint.name, 'fail', `Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      logTest(endpoint.name, 'fail', error.message);
      failed++;
    }
  }

  return { passed, failed, total: endpoints.length };
}

async function testPages() {
  logSection('6. Teste de Páginas');

  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Área do Cliente', path: '/area-cliente' },
    { name: 'Login', path: '/login' },
    { name: 'Cadastro Corretor', path: '/cadastro-corretor' },
  ];

  let passed = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.path}`);

      if (response.ok) {
        logTest(page.name, 'pass', `Status: ${response.status}`);
        passed++;
      } else {
        logTest(page.name, 'fail', `Status: ${response.status}`);
        failed++;
      }
    } catch (error) {
      logTest(page.name, 'fail', error.message);
      failed++;
    }
  }

  return { passed, failed, total: pages.length };
}

async function runAllTests() {
  console.clear();
  log('\n🧪 INICIANDO TESTES COMPLETOS DO SISTEMA\n', 'cyan');
  log(`Base URL: ${BASE_URL}\n`, 'blue');

  const results = {
    mongoConnection: false,
    seeds: false,
    clientAuth: false,
    firebaseAuth: false,
    apiEndpoints: { passed: 0, failed: 0, total: 0 },
    pages: { passed: 0, failed: 0, total: 0 },
  };

  // Teste 1: Conexão MongoDB
  results.mongoConnection = await testMongoConnection();

  // Teste 2: Seeds
  results.seeds = await testSeeds();

  // Teste 3: Autenticação Cliente
  results.clientAuth = await testClientAuth();

  // Teste 4: Autenticação Firebase
  results.firebaseAuth = await testFirebaseAuth();

  // Teste 5: API Endpoints
  results.apiEndpoints = await testAPIEndpoints();

  // Teste 6: Páginas
  results.pages = await testPages();

  // Resumo Final
  logSection('📊 RESUMO DOS TESTES');

  const totalTests = 6 + results.apiEndpoints.total + results.pages.total;
  const totalPassed =
    (results.mongoConnection ? 1 : 0) +
    (results.seeds ? 1 : 0) +
    (results.clientAuth ? 1 : 0) +
    (results.firebaseAuth ? 1 : 0) +
    results.apiEndpoints.passed +
    results.pages.passed;

  const totalFailed = totalTests - totalPassed;

  log(`Total de Testes: ${totalTests}`, 'blue');
  log(`✅ Passou: ${totalPassed}`, 'green');
  log(`❌ Falhou: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green');
  log(
    `📊 Taxa de Sucesso: ${((totalPassed / totalTests) * 100).toFixed(1)}%`,
    totalPassed === totalTests ? 'green' : 'yellow',
  );

  console.log('\n' + '='.repeat(60));

  if (totalPassed === totalTests) {
    log('\n🎉 TODOS OS TESTES PASSARAM!', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM', 'yellow');
    log('Verifique os detalhes acima para mais informações.', 'yellow');
    process.exit(1);
  }
}

// Executar testes
runAllTests().catch((error) => {
  log(`\n❌ Erro fatal ao executar testes: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

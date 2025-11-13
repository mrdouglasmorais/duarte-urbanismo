/**
 * Script para testar o seed completo do sistema
 * Executa limpeza e seed de todas as collections
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testSeed() {
  console.log('🧪 Iniciando testes de seed...\n');

  try {
    // 1. Limpar collections
    console.log('1️⃣  Limpando collections...');
    const clearResponse = await fetch(`${BASE_URL}/api/seed/clear`, {
      method: 'POST',
    });

    if (!clearResponse.ok) {
      throw new Error(`Erro ao limpar: ${clearResponse.statusText}`);
    }

    const clearData = await clearResponse.json();
    console.log('   ✅ Limpeza concluída');
    console.log(`   📊 Total removido: ${clearData.summary.totalDeleted} documentos\n`);

    // 2. Executar seed completo
    console.log('2️⃣  Executando seed completo...');
    const seedResponse = await fetch(`${BASE_URL}/api/seed/all`, {
      method: 'POST',
    });

    if (!seedResponse.ok) {
      const errorText = await seedResponse.text();
      throw new Error(`Erro ao executar seed: ${errorText}`);
    }

    const seedData = await seedResponse.json();
    console.log('   ✅ Seed concluído');
    console.log('   📊 Resumo:');
    console.log(`      MongoDB:`);
    console.log(`        - Empreendimentos: ${seedData.summary.mongodb.empreendimentos}`);
    console.log(`        - Clientes SGCI: ${seedData.summary.mongodb.clientesSGCI}`);
    console.log(`        - Negociações: ${seedData.summary.mongodb.negociacoes}`);
    console.log(`        - Corretores: ${seedData.summary.mongodb.corretores}`);
    console.log(`        - Recibos: ${seedData.summary.mongodb.recibos}`);
    console.log(`        - Clientes Auth: ${seedData.summary.mongodb.clientesAuth}`);
    console.log(`      Firebase:`);
    console.log(`        - Usuários criados: ${seedData.summary.firebase.usuariosCriados}`);
    console.log(`        - Usuários atualizados: ${seedData.summary.firebase.usuariosAtualizados}`);
    if (seedData.summary.firebase.errors > 0) {
      console.log(`        - Erros: ${seedData.summary.firebase.errors}`);
    }

    console.log('\n✅ Todos os testes passaram!');
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error.message);
    process.exit(1);
  }
}

testSeed();


/**
 * Script para testar se o Firebase Admin está configurado corretamente
 */

require('dotenv').config({ path: '.env.local' });

const path = require('path');
const fs = require('fs');

async function testFirebaseAdmin() {
  console.log('🧪 Testando configuração do Firebase Admin...\n');

  // Verificar variável de ambiente
  const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  console.log('📋 Variável GOOGLE_APPLICATION_CREDENTIALS:', credsPath || 'NÃO CONFIGURADA');

  if (!credsPath) {
    console.error('❌ Variável GOOGLE_APPLICATION_CREDENTIALS não está configurada!');
    console.log('\n💡 Solução:');
    console.log('   1. Crie um arquivo .env.local na raiz do projeto');
    console.log('   2. Adicione: GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json');
    process.exit(1);
  }

  // Verificar se o arquivo existe
  const serviceAccountPath = path.resolve(process.cwd(), credsPath.replace(/^\.\//, ''));
  console.log('📁 Caminho resolvido:', serviceAccountPath);
  console.log('📁 Arquivo existe:', fs.existsSync(serviceAccountPath) ? '✅ SIM' : '❌ NÃO');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Arquivo de service account não encontrado!');
    process.exit(1);
  }

  // Tentar carregar e validar o JSON
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Arquivo JSON válido');
    console.log('📧 Email da service account:', serviceAccount.client_email);
    console.log('🆔 Project ID:', serviceAccount.project_id);
  } catch (error) {
    console.error('❌ Erro ao ler arquivo JSON:', error.message);
    process.exit(1);
  }

  // Tentar inicializar Firebase Admin
  try {
    const admin = require('firebase-admin');
    const { initializeApp, cert, getApps } = require('firebase-admin/app');

    // Limpar apps existentes
    if (getApps().length > 0) {
      getApps().forEach(app => admin.app().delete());
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: 'duarte-urbanismo',
    });

    console.log('✅ Firebase Admin inicializado com sucesso!');

    // Testar Auth
    const auth = admin.auth();
    console.log('✅ Firebase Auth disponível');

    // Testar Firestore
    const db = admin.firestore();
    console.log('✅ Firestore disponível');

    // Testar criar um usuário de teste
    try {
      const testEmail = `test-${Date.now()}@test.com`;
      const userRecord = await auth.createUser({
        email: testEmail,
        password: 'test123456',
        displayName: 'Test User',
      });
      console.log('✅ Usuário de teste criado:', userRecord.email);

      // Deletar usuário de teste
      await auth.deleteUser(userRecord.uid);
      console.log('✅ Usuário de teste removido');

      console.log('\n🎉 Tudo funcionando perfeitamente!');
      process.exit(0);
    } catch (authError) {
      console.error('❌ Erro ao criar usuário de teste:', authError.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase Admin:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFirebaseAdmin();


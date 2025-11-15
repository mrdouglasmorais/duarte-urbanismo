#!/usr/bin/env ts-node

/**
 * Script para executar todos os seeds do projeto
 * Execute: npx ts-node scripts/seed-all.ts
 */

import { seedFirebaseUsers } from '../lib/seeds/firebase-users-seed';
import { seedEmpreendimentos } from '../lib/seeds/empreendimentos-seed';

async function seedAll() {
  console.log('🌱 Iniciando seeds do projeto...\n');

  try {
    // Seed de usuários Firebase
    console.log('📝 Executando seed de usuários Firebase...');
    const firebaseResult = await seedFirebaseUsers();
    console.log(`   ✓ Criados: ${firebaseResult.created}, Atualizados: ${firebaseResult.updated}, Erros: ${firebaseResult.errors}\n`);

    // Seed de empreendimentos
    console.log('🏗️  Executando seed de empreendimentos...');
    const empreendimentosResult = await seedEmpreendimentos();
    console.log(`   ✓ Unidades criadas: ${empreendimentosResult.unidades}, Config criada: ${empreendimentosResult.config ? 'Sim' : 'Não'}\n`);

    console.log('✅ Todos os seeds foram executados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
  }
}

seedAll();


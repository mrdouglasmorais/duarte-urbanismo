import { NextResponse } from 'next/server';
import { seedSgciDatabase } from '@/lib/sgci/repository';
import { seedRecibosDatabase } from '@/lib/recibos-repository';
import reciboSeeds from '@/lib/recibos/seed-data';
import { seedClientes } from '@/lib/seeds/clientes-seed';
import { seedFirebaseUsers } from '@/lib/seeds/firebase-users-seed';
import { getDb } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTIONS = {
  empreendimentos: 'sgci_empreendimentos',
  clientes: 'sgci_clientes',
  negociacoes: 'sgci_negociacoes',
  corretores: 'sgci_corretores',
  recibos: 'recibos',
  clientesAuth: 'clientes',
} as const;

export async function POST() {
  try {
    console.log('🌱 Iniciando seed completo do sistema...');

    // 1. Limpar todas as collections MongoDB
    console.log('\n🗑️  Limpando collections MongoDB...');
    const db = await getDb();
    const deletePromises = Object.values(COLLECTIONS).map(async (collectionName) => {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`   ✓ ${collectionName}: ${result.deletedCount} documentos removidos`);
        return { collection: collectionName, deleted: result.deletedCount };
      } catch (error: any) {
        if (error.code === 26) {
          // Collection não existe, ignorar
          console.log(`   ⚪ ${collectionName}: collection não existe`);
          return { collection: collectionName, deleted: 0 };
        }
        throw error;
      }
    });

    await Promise.all(deletePromises);
    console.log('✅ Collections MongoDB limpas');

    // 2. Seed SGCI (Empreendimentos, Clientes SGCI, Negociações, Corretores)
    console.log('\n📊 Populando dados do SGCI...');
    const sgciState = await seedSgciDatabase();
    console.log(`   ✓ ${sgciState.empreendimentos.length} empreendimentos`);
    console.log(`   ✓ ${sgciState.clientes.length} clientes SGCI`);
    console.log(`   ✓ ${sgciState.corretores.length} corretores`);
    console.log(`   ✓ ${sgciState.negociacoes.length} negociações`);

    // 3. Seed Recibos
    console.log('\n🧾 Populando recibos...');
    const recibos = await seedRecibosDatabase(reciboSeeds);
    console.log(`   ✓ ${recibos.length} recibos criados`);

    // 4. Seed Clientes (área do cliente - MongoDB)
    console.log('\n👥 Populando clientes (área do cliente)...');
    const clientesCount = await seedClientes();
    console.log(`   ✓ ${clientesCount} clientes criados`);

    // 5. Seed Firebase Users
    console.log('\n🔥 Populando usuários Firebase...');
    const firebaseResult = await seedFirebaseUsers();
    console.log(`   ✓ ${firebaseResult.created} usuários criados`);
    console.log(`   ✓ ${firebaseResult.updated} usuários atualizados`);
    if (firebaseResult.errors > 0) {
      console.log(`   ⚠ ${firebaseResult.errors} erros`);
    }

    const summary = {
      mongodb: {
        empreendimentos: sgciState.empreendimentos.length,
        clientesSGCI: sgciState.clientes.length,
        negociacoes: sgciState.negociacoes.length,
        corretores: sgciState.corretores.length,
        recibos: recibos.length,
        clientesAuth: clientesCount,
      },
      firebase: {
        usuariosCriados: firebaseResult.created,
        usuariosAtualizados: firebaseResult.updated,
        errors: firebaseResult.errors,
      },
    };

    console.log('\n✅ Seed completo concluído com sucesso!');
    console.log('📊 Resumo:', JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Seed completo executado com sucesso',
      summary,
    });
  } catch (error) {
    console.error('❌ Erro ao executar seed completo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao executar seed',
      },
      { status: 500 }
    );
  }
}


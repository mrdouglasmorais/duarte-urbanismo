import { getDb } from '@/lib/mongodb';
import { seedRecibosDatabase } from '@/lib/recibos-repository';
import reciboSeeds from '@/lib/recibos/seed-data';
import { seedSgciDatabase } from '@/lib/sgci/repository';
import { createUser } from '@/lib/users/repository';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLLECTIONS = {
  empreendimentos: 'sgci_empreendimentos',
  clientes: 'sgci_clientes',
  negociacoes: 'sgci_negociacoes',
  corretores: 'sgci_corretores',
  recibos: 'recibos',
  usuarios: 'usuarios'
} as const;

export async function POST() {
  try {
    console.log('🔄 Iniciando reset completo do banco de dados...');

    const db = await getDb();

    // Limpar todas as coleções
    console.log('🗑️  Limpando coleções...');
    const deletePromises = Object.values(COLLECTIONS).map(async (collectionName) => {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        console.log(`   ✓ ${collectionName}: ${result.deletedCount} documentos removidos`);
        return { collection: collectionName, deleted: result.deletedCount };
      } catch (error) {
        console.error(`   ✗ Erro ao limpar ${collectionName}:`, error);
        throw error;
      }
    });

    const deleteResults = await Promise.all(deletePromises);
    const totalDeleted = deleteResults.reduce((sum, r) => sum + r.deleted, 0);
    console.log(`✅ Total de documentos removidos: ${totalDeleted}`);

    // Criar usuário padrão
    console.log('👤 Criando usuário padrão...');
    try {
      await createUser({
        nome: 'Gestor S.G.C.I.',
        email: 'gestor@sgci.com',
        password: '123456',
        ativo: true
      });
      console.log('   ✓ Usuário padrão criado');
    } catch (error) {
      if (error instanceof Error && error.message === 'Email já cadastrado') {
        console.log('   ⚠ Usuário padrão já existe (ignorado)');
      } else {
        console.error('   ✗ Erro ao criar usuário padrão:', error);
        throw error;
      }
    }

    // Popular dados do SGCI
    console.log('📊 Populando dados do SGCI...');
    const sgciState = await seedSgciDatabase();
    console.log(`   ✓ ${sgciState.empreendimentos.length} empreendimentos`);
    console.log(`   ✓ ${sgciState.clientes.length} clientes`);
    console.log(`   ✓ ${sgciState.corretores.length} corretores`);
    console.log(`   ✓ ${sgciState.negociacoes.length} negociações`);

    // Popular recibos
    console.log('🧾 Populando recibos...');
    const recibos = await seedRecibosDatabase(reciboSeeds);
    console.log(`   ✓ ${recibos.length} recibos criados`);

    const summary = {
      deleted: {
        total: totalDeleted,
        byCollection: deleteResults.reduce((acc, r) => {
          acc[r.collection] = r.deleted;
          return acc;
        }, {} as Record<string, number>)
      },
      created: {
        usuarios: 1,
        empreendimentos: sgciState.empreendimentos.length,
        clientes: sgciState.clientes.length,
        corretores: sgciState.corretores.length,
        negociacoes: sgciState.negociacoes.length,
        recibos: recibos.length
      }
    };

    console.log('✅ Reset completo concluído com sucesso!');
    console.log('📊 Resumo:', JSON.stringify(summary, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Banco de dados resetado e populado com sucesso',
      summary
    });
  } catch (error) {
    console.error('❌ Erro ao resetar banco de dados:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao resetar banco de dados'
      },
      { status: 500 }
    );
  }
}


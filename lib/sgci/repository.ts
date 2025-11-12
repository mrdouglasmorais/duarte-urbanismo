import { getDb } from '@/lib/mongodb';
import seedData from '@/lib/sgci/seed-data';
import type { Corretor, Cliente, Empreendimento, Negociacao, Parcela, SgciState } from '@/types/sgci';

const COLLECTIONS = {
  empreendimentos: 'sgci_empreendimentos',
  clientes: 'sgci_clientes',
  negociacoes: 'sgci_negociacoes',
  corretores: 'sgci_corretores'
} as const;

type CollectionKey = keyof typeof COLLECTIONS;

function stripMongoId<T extends object>(docs: T[]): T[] {
  return docs.map(doc => {
    const clone = { ...(doc as Record<string, unknown>) };
    delete clone._id;
    return clone as T;
  });
}

export async function fetchSgciState(): Promise<SgciState> {
  const db = await getDb();

  const [empreendimentos, clientes, negociacoes, corretores] = await Promise.all([
    db.collection<Empreendimento>(COLLECTIONS.empreendimentos).find().sort({ nome: 1 }).toArray(),
    db.collection<Cliente>(COLLECTIONS.clientes).find().sort({ nome: 1 }).toArray(),
    db.collection<Negociacao>(COLLECTIONS.negociacoes).find().sort({ criadoEm: -1 }).toArray(),
    db.collection<Corretor>(COLLECTIONS.corretores).find().sort({ nome: 1 }).toArray()
  ]);

  return {
    empreendimentos: stripMongoId(empreendimentos),
    clientes: stripMongoId(clientes),
    negociacoes: stripMongoId(negociacoes).map(negociacao => ({
      ...negociacao,
      parcelas: Array.isArray(negociacao.parcelas)
        ? stripMongoId<Parcela>(negociacao.parcelas as Parcela[])
        : []
    })),
    corretores: stripMongoId(corretores)
  };
}

export async function replaceSgciState(state: SgciState): Promise<void> {
  const db = await getDb();

  await Promise.all((Object.keys(COLLECTIONS) as CollectionKey[]).map(async key => {
    await db.collection(COLLECTIONS[key]).deleteMany({});
  }));

  if (state.empreendimentos.length) {
    await db.collection(COLLECTIONS.empreendimentos).insertMany(state.empreendimentos);
  }
  if (state.clientes.length) {
    await db.collection(COLLECTIONS.clientes).insertMany(state.clientes);
  }
  if (state.corretores.length) {
    await db.collection(COLLECTIONS.corretores).insertMany(state.corretores);
  }
  if (state.negociacoes.length) {
    await db.collection(COLLECTIONS.negociacoes).insertMany(state.negociacoes);
  }
}

export async function seedSgciDatabase(): Promise<SgciState> {
  const stateCopy: SgciState = JSON.parse(JSON.stringify(seedData));
  await replaceSgciState(stateCopy);
  return stateCopy;
}

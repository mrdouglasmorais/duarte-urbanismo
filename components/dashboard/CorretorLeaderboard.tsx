'use client';

import { useSgci } from '@/contexts/sgci-context';
import { formatarMoeda } from '@/lib/utils';
import { useMemo } from 'react';
import Link from 'next/link';

interface CorretorStats {
  id: string;
  nome: string;
  creci: string;
  foto?: string;
  vendas: number;
  valorTotal: number;
  negociacoesEmAndamento: number;
  parcelasRecebidas: number;
  valorRecebido: number;
}

export default function CorretorLeaderboard() {
  const { negociacoes, corretores } = useSgci();

  const ranking = useMemo(() => {
    const statsPorCorretor: Record<string, CorretorStats> = {};

    // Inicializar todos os corretores
    corretores.forEach((corretor) => {
      statsPorCorretor[corretor.id] = {
        id: corretor.id,
        nome: corretor.nome,
        creci: corretor.creci,
        foto: corretor.foto,
        vendas: 0,
        valorTotal: 0,
        negociacoesEmAndamento: 0,
        parcelasRecebidas: 0,
        valorRecebido: 0,
      };
    });

    // Processar negociações
    negociacoes.forEach((negociacao) => {
      if (!negociacao.corretorId) return;

      const corretorId = negociacao.corretorId;
      if (!statsPorCorretor[corretorId]) {
        const corretor = corretores.find((c) => c.id === corretorId);
        statsPorCorretor[corretorId] = {
          id: corretorId,
          nome: corretor?.nome || 'Corretor não encontrado',
          creci: corretor?.creci || '',
          foto: corretor?.foto,
          vendas: 0,
          valorTotal: 0,
          negociacoesEmAndamento: 0,
          parcelasRecebidas: 0,
          valorRecebido: 0,
        };
      }

      const stats = statsPorCorretor[corretorId];

      if (negociacao.status === 'Fechado') {
        stats.vendas += 1;
        stats.valorTotal += negociacao.valorContrato || 0;
      } else if (
        negociacao.status === 'Em andamento' ||
        negociacao.status === 'Em prospecção' ||
        negociacao.status === 'Em Andamento' ||
        negociacao.status === 'Aguardando aprovação'
      ) {
        stats.negociacoesEmAndamento += 1;
      }

      // Calcular parcelas recebidas
      negociacao.parcelas.forEach((parcela) => {
        if (parcela.status === 'Paga') {
          stats.parcelasRecebidas += 1;
          stats.valorRecebido += parcela.valor;
        }
      });
    });

    // Converter para array e ordenar por vendas (quantidade) e depois por valor total
    return Object.values(statsPorCorretor)
      .filter((stats) => stats.vendas > 0 || stats.negociacoesEmAndamento > 0)
      .sort((a, b) => {
        // Primeiro por quantidade de vendas fechadas
        if (b.vendas !== a.vendas) {
          return b.vendas - a.vendas;
        }
        // Depois por valor total
        return b.valorTotal - a.valorTotal;
      });
  }, [negociacoes, corretores]);

  const top3 = ranking.slice(0, 3);
  const outros = ranking.slice(3);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 2:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      case 3:
        return (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg">
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) return null;
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
        {position}
      </div>
    );
  };

  if (ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="mt-4 text-lg font-semibold text-slate-900">Nenhuma venda registrada</p>
          <p className="mt-2 text-sm text-slate-600">As vendas dos corretores aparecerão aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ranking de Vendas</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">🏆 Top Corretores</h2>
        </div>
        <Link
          href="/painel/corretores"
          className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Ver todos
        </Link>
      </div>

      {/* Top 3 - Pódio */}
      {top3.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* 2º Lugar */}
          {top3[1] && (
            <div className="order-2 md:order-1">
              <div className="relative rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-center">
                  {getMedalIcon(2)}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900">{top3[1].nome}</h3>
                  {top3[1].creci && <p className="mt-1 text-xs text-slate-500">CRECI: {top3[1].creci}</p>}
                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Vendas</p>
                      <p className="mt-1 text-2xl font-bold text-slate-900">{top3[1].vendas}</p>
                    </div>
                    <div className="rounded-lg bg-slate-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">Valor Total</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">{formatarMoeda(top3[1].valorTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 1º Lugar */}
          {top3[0] && (
            <div className="order-1 md:order-2">
              <div className="relative rounded-2xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white p-6 shadow-xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">CAMPEÃO</div>
                </div>
                <div className="mb-4 flex items-center justify-center">
                  {getMedalIcon(1)}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900">{top3[0].nome}</h3>
                  {top3[0].creci && <p className="mt-1 text-xs text-slate-500">CRECI: {top3[0].creci}</p>}
                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg bg-yellow-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow-700">Vendas</p>
                      <p className="mt-1 text-3xl font-bold text-yellow-900">{top3[0].vendas}</p>
                    </div>
                    <div className="rounded-lg bg-yellow-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-yellow-700">Valor Total</p>
                      <p className="mt-1 text-xl font-bold text-yellow-900">{formatarMoeda(top3[0].valorTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3º Lugar */}
          {top3[2] && (
            <div className="order-3">
              <div className="relative rounded-2xl border-2 border-amber-600 bg-gradient-to-br from-amber-50 to-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-center">
                  {getMedalIcon(3)}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-slate-900">{top3[2].nome}</h3>
                  {top3[2].creci && <p className="mt-1 text-xs text-slate-500">CRECI: {top3[2].creci}</p>}
                  <div className="mt-4 space-y-2">
                    <div className="rounded-lg bg-amber-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Vendas</p>
                      <p className="mt-1 text-2xl font-bold text-amber-900">{top3[2].vendas}</p>
                    </div>
                    <div className="rounded-lg bg-amber-100 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-amber-700">Valor Total</p>
                      <p className="mt-1 text-lg font-bold text-amber-900">{formatarMoeda(top3[2].valorTotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranking Completo */}
      {outros.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-900">Ranking Completo</h3>
          <div className="space-y-3">
            {outros.map((corretor, index) => {
              const position = index + 4;
              const maxVendas = ranking[0]?.vendas || 1;
              const progresso = (corretor.vendas / maxVendas) * 100;

              return (
                <div
                  key={corretor.id}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/50"
                >
                  {/* Posição */}
                  <div className="flex-shrink-0">
                    {getPositionBadge(position)}
                  </div>

                  {/* Informações do Corretor */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900">{corretor.nome}</h4>
                        {corretor.creci && <p className="text-xs text-slate-500">CRECI: {corretor.creci}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{corretor.vendas} vendas</p>
                        <p className="text-xs text-slate-600">{formatarMoeda(corretor.valorTotal)}</p>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>Progresso</span>
                        <span>{Math.round(progresso)}% do líder</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Estatísticas Adicionais */}
                    <div className="mt-3 flex gap-4 text-xs">
                      {corretor.negociacoesEmAndamento > 0 && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{corretor.negociacoesEmAndamento} em andamento</span>
                        </div>
                      )}
                      {corretor.parcelasRecebidas > 0 && (
                        <div className="flex items-center gap-1 text-green-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{corretor.parcelasRecebidas} parcelas recebidas</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Estatísticas Gerais */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Total de Vendas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">
            {ranking.reduce((acc, c) => acc + c.vendas, 0)}
          </p>
          <p className="mt-1 text-xs text-emerald-700">por todos os corretores</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">Valor Total</p>
          <p className="mt-2 text-xl font-bold text-blue-900">
            {formatarMoeda(ranking.reduce((acc, c) => acc + c.valorTotal, 0))}
          </p>
          <p className="mt-1 text-xs text-blue-700">em contratos fechados</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-700">Corretores Ativos</p>
          <p className="mt-2 text-2xl font-bold text-purple-900">{ranking.length}</p>
          <p className="mt-1 text-xs text-purple-700">com vendas registradas</p>
        </div>
      </div>
    </div>
  );
}


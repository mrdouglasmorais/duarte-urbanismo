"use client";

import PaymentOverviewCharts from "@/components/dashboard/PaymentOverviewCharts";
import CorretorLeaderboard from "@/components/dashboard/CorretorLeaderboard";
import { useSgci } from "@/contexts/sgci-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { useMemo } from "react";
import Link from "next/link";
import { formatarMoeda, formatarData } from "@/lib/utils";

const destaque = {
  titulo: "🌅 SUPER LANÇAMENTO: PÔR DO SOL ECO VILLAGE! 🌳",
  descricao:
    "Seu refúgio de natureza e lazer em Tijucas/SC. Construa sua chácara em um condomínio exclusivo que une tranquilidade, segurança e infraestrutura completa!",
  localizacao: [
    "Apenas 4 km do Centro de Tijucas (Bairro Itinga).",
    "Fácil acesso à BR-101 e praias."
  ],
  caracteristicas: [
    "Lotes amplos, a partir de 1.000 m² (até 3.500 m²).",
    "32 áreas de lazer exclusivas: club house, trilhas, espaços gourmet e esportivos."
  ],
  condicoes: [
    "Valor base do m²: R$ 350,00",
    "Entrada mínima: 10%",
    "Parcelamento: saldo em até 120 parcelas",
    "Índice de correção: IPCA + 0,85% a.m. direto com a incorporadora"
  ],
  contato: "+55 47 9211-2284"
};

export default function HomePage() {
  const { empreendimentos, clientes, negociacoes, corretores } = useSgci();
  const { profile } = useFirebaseAuth();

  const isAdmin = profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN';
  const corretoresPendentes = useMemo(() =>
    corretores.filter(c => c.status === 'Pendente'),
    [corretores]
  );

  const indicadores = useMemo(() => {
    const unidadesDisponiveis = empreendimentos.filter((item) => item.status === "Disponível").length;
    const unidadesVendidas = empreendimentos.filter((item) => item.status === "Vendido").length;
    const totalParcelas = negociacoes.reduce((acc: number, negociacao) => acc + negociacao.parcelas.length, 0);
    const parcelasPagas = negociacoes.reduce(
      (acc: number, negociacao) => acc + negociacao.parcelas.filter((parcela) => parcela.status === "Paga").length,
      0
    );
    const parcelasPendentes = negociacoes.reduce(
      (acc: number, negociacao) => acc + negociacao.parcelas.filter((parcela) => parcela.status === "Pendente").length,
      0
    );
    const totalInvestido = negociacoes.reduce(
      (acc: number, negociacao) =>
        acc +
        negociacao.parcelas
          .filter((parcela) => parcela.status === "Paga")
          .reduce((total: number, parcela) => total + parcela.valor, 0),
      0
    );
    const totalPendente = negociacoes.reduce(
      (acc: number, negociacao) =>
        acc +
        negociacao.parcelas
          .filter((parcela) => parcela.status === "Pendente")
          .reduce((total: number, parcela) => total + parcela.valor, 0),
      0
    );
    const negociacoesFechadas = negociacoes.filter((n) => n.status === "Fechado").length;
    const negociacoesEmAndamento = negociacoes.filter((n) => n.status === "Em andamento").length;

    return {
      empreendimentos: empreendimentos.length,
      unidadesDisponiveis,
      unidadesVendidas,
      clientes: clientes.length,
      negociacoesFechadas,
      negociacoesEmAndamento,
      parcelasPagas,
      parcelasPendentes,
      totalParcelas,
      totalInvestido,
      totalPendente,
      corretores: corretores.length,
    };
  }, [empreendimentos, clientes, negociacoes, corretores]);

  // Próximas parcelas a vencer (próximos 30 dias)
  const proximasParcelas = useMemo(() => {
    const hoje = new Date();
    const proximos30Dias = new Date();
    proximos30Dias.setDate(hoje.getDate() + 30);

    const parcelas: Array<{
      negociacaoId: string;
      parcelaId: string;
      clienteNome: string;
      vencimento: string;
      valor: number;
      diasAteVencimento: number;
    }> = [];

    negociacoes.forEach((negociacao) => {
      const cliente = clientes.find((c) => c.id === negociacao.clienteId);
      negociacao.parcelas
        .filter((parcela) => parcela.status === "Pendente")
        .forEach((parcela) => {
          const vencimento = new Date(parcela.vencimento + "T00:00:00");
          if (vencimento >= hoje && vencimento <= proximos30Dias) {
            const diasAteVencimento = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            parcelas.push({
              negociacaoId: negociacao.id,
              parcelaId: parcela.id,
              clienteNome: cliente?.nome || "Cliente não encontrado",
              vencimento: parcela.vencimento,
              valor: parcela.valor,
              diasAteVencimento,
            });
          }
        });
    });

    return parcelas.sort((a, b) => a.diasAteVencimento - b.diasAteVencimento).slice(0, 5);
  }, [negociacoes, clientes]);

  // Negociações recentes
  const negociacoesRecentes = useMemo(() => {
    return negociacoes
      .sort((a, b) => {
        const dataA = new Date(a.criadoEm || "2024-01-01");
        const dataB = new Date(b.criadoEm || "2024-01-01");
        return dataB.getTime() - dataA.getTime();
      })
      .slice(0, 5);
  }, [negociacoes]);

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Visão geral do sistema e operações</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Última atualização</p>
          <p className="mt-1 text-sm font-medium text-slate-900">{new Date().toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Alerta de Corretores Pendentes (apenas para admins) */}
      {isAdmin && corretoresPendentes.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-500">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900">
                {corretoresPendentes.length} corretor{corretoresPendentes.length > 1 ? 'es' : ''} aguardando aprovação
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Há {corretoresPendentes.length} novo{corretoresPendentes.length > 1 ? 's' : ''} cadastro{corretoresPendentes.length > 1 ? 's' : ''} de corretor{corretoresPendentes.length > 1 ? 'es' : ''} que precisa{corretoresPendentes.length > 1 ? 'm' : ''} ser {corretoresPendentes.length > 1 ? 'revisado' : 'revisado'} e aprovado antes de aparecer no sistema.
              </p>
              <Link
                href="/painel/corretores"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
              >
                <span>Revisar corretores pendentes</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas Principais */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 rounded-full bg-emerald-500/20 p-3">
            <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">Clientes Ativos</p>
          <p className="mt-2 text-3xl font-bold text-emerald-900">{indicadores.clientes}</p>
          <p className="mt-1 text-xs text-emerald-700/70">Total cadastrado</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 rounded-full bg-blue-500/20 p-3">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-700">Empreendimentos</p>
          <p className="mt-2 text-3xl font-bold text-blue-900">{indicadores.empreendimentos}</p>
          <p className="mt-1 text-xs text-blue-700/70">{indicadores.unidadesDisponiveis} disponíveis</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 rounded-full bg-amber-500/20 p-3">
            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-700">Negociações</p>
          <p className="mt-2 text-3xl font-bold text-amber-900">{indicadores.negociacoesFechadas}</p>
          <p className="mt-1 text-xs text-amber-700/70">{indicadores.negociacoesEmAndamento} em andamento</p>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="absolute right-4 top-4 rounded-full bg-purple-500/20 p-3">
            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-700">Recebido</p>
          <p className="mt-2 text-2xl font-bold text-purple-900">{formatarMoeda(indicadores.totalInvestido)}</p>
          <p className="mt-1 text-xs text-purple-700/70">{indicadores.parcelasPagas} parcelas pagas</p>
        </div>
      </section>

      {/* Segunda Linha de Métricas */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Parcelas Pendentes</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{indicadores.parcelasPendentes}</p>
              <p className="mt-1 text-sm text-slate-600">{formatarMoeda(indicadores.totalPendente)}</p>
            </div>
            <div className="rounded-full bg-red-100 p-3">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Unidades Vendidas</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{indicadores.unidadesVendidas}</p>
              <p className="mt-1 text-sm text-slate-600">
                {indicadores.empreendimentos > 0
                  ? `${Math.round((indicadores.unidadesVendidas / indicadores.empreendimentos) * 100)}% do total`
                  : "0% do total"}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Corretores</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{indicadores.corretores}</p>
              <p className="mt-1 text-sm text-slate-600">Equipe comercial</p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Principal: Gráficos e Atividades */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Esquerda: Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ranking de Corretores - Gamificação */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <CorretorLeaderboard />
          </div>

          {/* Gráficos de Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Análise Financeira</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">Overview de Pagamentos</h2>
              </div>
              <Link
                href="/painel/negociacoes"
                className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Ver todas
              </Link>
            </div>
            <PaymentOverviewCharts />
          </div>

          {/* Destaque do Empreendimento */}
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.5em] text-amber-600">Destaque do Mês</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">{destaque.titulo}</h2>
            <p className="mt-3 text-sm text-slate-700">{destaque.descricao}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Localização</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  {destaque.localizacao.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
              <div className="rounded-xl bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Características</p>
                <ul className="mt-2 space-y-1 text-xs text-slate-700">
                  {destaque.caracteristicas.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
            <div className="mt-4 flex items-center gap-4">
              <a
                href={`https://wa.me/554792112284`}
              target="_blank"
              rel="noreferrer"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
                Falar com especialista
            </a>
              <p className="text-xs text-slate-600">{destaque.contato}</p>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Atividades e Alertas */}
        <div className="space-y-6">
          {/* Próximas Parcelas */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Próximas Ações</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Parcelas a Vencer</h3>
              </div>
              <Link
                href="/painel/negociacoes"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Ver todas
              </Link>
            </div>
            {proximasParcelas.length > 0 ? (
              <div className="space-y-3">
                {proximasParcelas.map((parcela) => (
                  <div
                    key={`${parcela.negociacaoId}-${parcela.parcelaId}`}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{parcela.clienteNome}</p>
                        <p className="mt-1 text-xs text-slate-600">{formatarData(parcela.vencimento)}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-bold text-slate-900">{formatarMoeda(parcela.valor)}</p>
                        <p
                          className={`mt-1 text-xs font-medium ${
                            parcela.diasAteVencimento <= 7 ? "text-red-600" : "text-amber-600"
                          }`}
                        >
                          {parcela.diasAteVencimento === 0
                            ? "Vence hoje"
                            : parcela.diasAteVencimento === 1
                              ? "Vence amanhã"
                              : `${parcela.diasAteVencimento} dias`}
                        </p>
                      </div>
                    </div>
              </div>
            ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">Nenhuma parcela a vencer nos próximos 30 dias</p>
              </div>
            )}
          </div>

          {/* Negociações Recentes */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Atividades</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Negociações Recentes</h3>
              </div>
              <Link
                href="/painel/negociacoes"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Ver todas
              </Link>
            </div>
            {negociacoesRecentes.length > 0 ? (
              <div className="space-y-3">
                {negociacoesRecentes.map((negociacao) => {
                  const cliente = clientes.find((c) => c.id === negociacao.clienteId);
                  const empreendimento = empreendimentos.find((e) => e.id === negociacao.unidadeId);
                  return (
                    <div
                      key={negociacao.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:bg-slate-100"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{cliente?.nome || "Cliente não encontrado"}</p>
                          <p className="mt-1 text-xs text-slate-600">{empreendimento?.nome || "Empreendimento não encontrado"}</p>
                          {negociacao.criadoEm && (
                            <p className="mt-1 text-xs text-slate-500">{formatarData(negociacao.criadoEm)}</p>
                          )}
                        </div>
                        <div className="ml-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              negociacao.status === "Fechado"
                                ? "bg-green-100 text-green-800"
                                : negociacao.status === "Em andamento"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {negociacao.status}
                          </span>
                        </div>
                      </div>
                      {negociacao.valorContrato && (
                        <p className="mt-2 text-sm font-bold text-slate-900">{formatarMoeda(negociacao.valorContrato)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center">
                <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-slate-500">Nenhuma negociação cadastrada</p>
        </div>
            )}
        </div>

          {/* Ações Rápidas */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Ações Rápidas</p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">Acesso Direto</h3>
            <div className="mt-4 space-y-2">
              <Link
                href="/painel/empreendimentos"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Empreendimentos
              </Link>
              <Link
                href="/painel/clientes"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Clientes
              </Link>
              <Link
                href="/painel/negociacoes"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Negociações
              </Link>
              <Link
                href="/painel/corretores"
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Corretores
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

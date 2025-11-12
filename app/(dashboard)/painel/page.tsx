"use client";

import { useMemo } from "react";
import { useSgci } from "@/contexts/sgci-context";

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
  const { empreendimentos, clientes, negociacoes } = useSgci();

  const indicadores = useMemo(() => {
    const unidadesDisponiveis = empreendimentos.filter(item => item.status === "Disponível").length;
    const totalParcelas = negociacoes.reduce((acc, negociacao) => acc + negociacao.parcelas.length, 0);
    const parcelasPagas = negociacoes.reduce(
      (acc, negociacao) => acc + negociacao.parcelas.filter(parcela => parcela.status === "Paga").length,
      0
    );
    const totalInvestido = negociacoes.reduce(
      (acc, negociacao) =>
        acc +
        negociacao.parcelas
          .filter(parcela => parcela.status === "Paga")
          .reduce((total, parcela) => total + parcela.valor, 0),
      0
    );

    return [
      { label: "Empreendimentos cadastrados", value: empreendimentos.length },
      { label: "Clientes ativos", value: clientes.length },
      { label: "Unidades disponíveis", value: unidadesDisponiveis },
      { label: "Parcelas pagas", value: `${parcelasPagas}/${totalParcelas}` || "0/0" },
      {
        label: "Montante já pago",
        value: totalInvestido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      }
    ];
  }, [empreendimentos, clientes, negociacoes]);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.5em] text-amber-500">Destaque do mês</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{destaque.titulo}</h1>
          <p className="mt-4 text-base text-slate-600">{destaque.descricao}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Localização</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {destaque.localizacao.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Características</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {destaque.caracteristicas.map(item => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Condições de investimento</p>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              {destaque.condicoes.map(item => (
                <p key={item}>• {item}</p>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={`https://wa.me/554896696009`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white"
            >
              Falar com um especialista
            </a>
            <p className="text-sm text-slate-500">Contato direto: {destaque.contato}</p>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-slate-900/95 p-6 text-white shadow-md">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Painel rápido</p>
          <div className="mt-4 space-y-4">
            {indicadores.map(item => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Visão geral</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Fluxo operacional do S.G.C.I</h2>
        <p className="mt-4 text-sm text-slate-600">
          Centralize cadastros de empreendimentos, clientes e negociações, monitore parcelas em tempo real e mantenha a
          rastreabilidade das decisões comerciais com segurança e usabilidade pensadas para equipes imobiliárias.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Cadastro completo", "Negociação com permuta", "Controle financeiro"].map((title, index) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Etapa 0{index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {index === 0 &&
                  "Cadastre unidades com metragem, valores e status atualizados em segundos."}
                {index === 1 &&
                  "Associe clientes a lotes, registre as condições contratuais e descreva permutas com avaliação."}
                {index === 2 &&
                  "Acompanhe parcelas, pagamentos confirmados e saldo em aberto direto no painel financeiro."}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

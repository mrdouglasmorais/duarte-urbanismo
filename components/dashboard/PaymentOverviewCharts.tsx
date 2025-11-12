'use client';

import { useSgci } from '@/contexts/sgci-context';
import { formatarMoeda } from '@/lib/utils';
import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0F172A', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function PaymentOverviewCharts() {
  const { negociacoes, corretores } = useSgci();

  // Dados de pagamentos pendentes por mês
  const pagamentosPendentesPorMes = useMemo(() => {
    const hoje = new Date();
    const meses: Record<string, { mes: string; valor: number; quantidade: number }> = {};

    negociacoes.forEach(negociacao => {
      negociacao.parcelas
        .filter(parcela => parcela.status === 'Pendente')
        .forEach(parcela => {
          const dataVencimento = new Date(parcela.vencimento + 'T00:00:00');
          const mesAno = dataVencimento.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

          if (!meses[mesAno]) {
            meses[mesAno] = { mes: mesAno, valor: 0, quantidade: 0 };
          }
          meses[mesAno].valor += parcela.valor;
          meses[mesAno].quantidade += 1;
        });
    });

    return Object.values(meses)
      .sort((a, b) => {
        const dateA = new Date(a.mes.split(' ')[1] + '-' + a.mes.split(' ')[0]);
        const dateB = new Date(b.mes.split(' ')[1] + '-' + b.mes.split(' ')[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 6); // Últimos 6 meses
  }, [negociacoes]);

  // Dados de corretores que realizaram vendas
  const corretoresVendas = useMemo(() => {
    const vendasPorCorretor: Record<string, { nome: string; vendas: number; valorTotal: number }> = {};

    negociacoes
      .filter(negociacao => negociacao.corretorId && negociacao.status === 'Fechado')
      .forEach(negociacao => {
        const corretorId = negociacao.corretorId!;
        const corretor = corretores.find(c => c.id === corretorId);
        const nomeCorretor = corretor?.nome || 'Sem corretor';

        if (!vendasPorCorretor[corretorId]) {
          vendasPorCorretor[corretorId] = {
            nome: nomeCorretor,
            vendas: 0,
            valorTotal: 0
          };
        }

        vendasPorCorretor[corretorId].vendas += 1;
        vendasPorCorretor[corretorId].valorTotal += negociacao.valorContrato || 0;
      });

    return Object.values(vendasPorCorretor)
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 10); // Top 10 corretores
  }, [negociacoes, corretores]);

  // Dados de pagamentos recebidos vs a receber
  const pagamentosRecebidosVsPendentes = useMemo(() => {
    let recebido = 0;
    let pendente = 0;

    negociacoes.forEach(negociacao => {
      negociacao.parcelas.forEach(parcela => {
        if (parcela.status === 'Paga') {
          recebido += parcela.valor;
        } else if (parcela.status === 'Pendente') {
          pendente += parcela.valor;
        }
      });
    });

    return [
      { name: 'Recebido', value: recebido, color: '#10B981' },
      { name: 'A Receber', value: pendente, color: '#F59E0B' }
    ];
  }, [negociacoes]);

  // Estatísticas gerais
  const stats = useMemo(() => {
    const totalPendentes = negociacoes.reduce(
      (acc, neg) => acc + neg.parcelas.filter(p => p.status === 'Pendente').length,
      0
    );
    const totalRecebidos = negociacoes.reduce(
      (acc, neg) => acc + neg.parcelas.filter(p => p.status === 'Paga').length,
      0
    );
    const valorPendente = negociacoes.reduce(
      (acc, neg) =>
        acc +
        neg.parcelas
          .filter(p => p.status === 'Pendente')
          .reduce((sum, p) => sum + p.valor, 0),
      0
    );
    const valorRecebido = negociacoes.reduce(
      (acc, neg) =>
        acc +
        neg.parcelas
          .filter(p => p.status === 'Paga')
          .reduce((sum, p) => sum + p.valor, 0),
      0
    );

    return {
      totalPendentes,
      totalRecebidos,
      valorPendente,
      valorRecebido,
      corretoresAtivos: corretoresVendas.length
    };
  }, [negociacoes, corretoresVendas]);

  return (
    <div className="space-y-8">
      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-700">Pendentes</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{stats.totalPendentes}</p>
          <p className="mt-1 text-sm text-amber-700">{formatarMoeda(stats.valorPendente)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Recebidos</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{stats.totalRecebidos}</p>
          <p className="mt-1 text-sm text-emerald-700">{formatarMoeda(stats.valorRecebido)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600">Corretores Ativos</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.corretoresAtivos}</p>
          <p className="mt-1 text-sm text-slate-600">com vendas fechadas</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-700">Total Geral</p>
          <p className="mt-2 text-2xl font-bold text-blue-900">{formatarMoeda(stats.valorRecebido + stats.valorPendente)}</p>
          <p className="mt-1 text-sm text-blue-700">recebido + pendente</p>
        </div>
      </div>

      {/* Gráfico de Pagamentos Recebidos vs A Receber */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pagamentos Recebidos vs A Receber</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pagamentosRecebidosVsPendentes}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${formatarMoeda(value)} (${percent ? (percent * 100).toFixed(1) : '0'}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pagamentosRecebidosVsPendentes.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => formatarMoeda(value)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Pagamentos Pendentes por Mês */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Pagamentos Pendentes por Mês</h3>
        {pagamentosPendentesPorMes.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pagamentosPendentesPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis tickFormatter={(value) => formatarMoeda(value)} />
              <Tooltip formatter={(value: number) => formatarMoeda(value)} />
              <Legend />
              <Bar dataKey="valor" fill="#F59E0B" name="Valor Pendente" />
              <Bar dataKey="quantidade" fill="#EF4444" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-400">
            <p>Nenhum pagamento pendente encontrado</p>
          </div>
        )}
      </div>

      {/* Gráfico de Corretores que Realizaram Vendas */}
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Corretores que Realizaram Vendas</h3>
        {corretoresVendas.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={corretoresVendas} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => formatarMoeda(value)} />
              <YAxis dataKey="nome" type="category" width={150} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'valorTotal') return formatarMoeda(value);
                  return value;
                }}
              />
              <Legend />
              <Bar dataKey="vendas" fill="#3B82F6" name="Número de Vendas" />
              <Bar dataKey="valorTotal" fill="#10B981" name="Valor Total (R$)" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-slate-400">
            <p>Nenhum corretor com vendas fechadas encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}


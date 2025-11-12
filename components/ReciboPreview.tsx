'use client';

import { formatarCEP, formatarCPFCNPJ, formatarData, formatarDataHoraCompleta, formatarMoeda } from '@/lib/utils';
import { ReciboData } from '@/types/recibo';
import Image from 'next/image';
import QRCode from 'qrcode';
import { startTransition, useEffect, useRef, useState } from 'react';
import PixCopyButton from './PixCopyButton';

interface ReciboPreviewProps {
  data: ReciboData;
  qrCodeData?: string;
  onPrint?: () => void;
  onGeneratePDF?: () => void;
}

export default function ReciboPreview({ data, qrCodeData, onPrint, onGeneratePDF }: ReciboPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);

  useEffect(() => {
    if (qrCodeData && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrCodeData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('Erro ao gerar QR Code:', err);
        // Não quebra a aplicação se o QR Code falhar
      });
      try {
        if (typeof qrCodeData === 'string' && qrCodeData.trim().length > 0) {
          const parsed = JSON.parse(qrCodeData);
          startTransition(() => {
            setPixPayload(typeof parsed?.pixPayload === 'string' ? parsed.pixPayload : null);
            setPixKey(typeof parsed?.pixKey === 'string' ? parsed.pixKey : null);
            setHash(typeof parsed?.hash === 'string' ? parsed.hash : null);
          });
        }
      } catch (error) {
        console.error('Erro ao parsear QR Code data:', error);
        startTransition(() => {
          setPixPayload(null);
          setPixKey(null);
          setHash(null);
        });
      }
    }
  }, [qrCodeData]);

  useEffect(() => {
    if (pixPayload && pixCanvasRef.current) {
      if (typeof pixPayload === 'string' && pixPayload.trim().length > 0) {
        QRCode.toCanvas(pixCanvasRef.current, pixPayload, {
          width: 120,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        }).catch(err => {
          console.error('Erro ao gerar QR Code PIX:', err);
          // Não quebra a aplicação se o QR Code PIX falhar
        });
      }
    }
  }, [pixPayload]);

  return (
    <div
      id="recibo-preview"
      className="recibo-container w-full max-w-4xl mx-auto bg-white/95 p-12 shadow-[0_25px_60px_rgba(15,23,42,0.18)] rounded-[2.75rem] border border-slate-200/60"
    >
      {/* Header */}
      <div className="relative mb-10 pb-8 border-b border-slate-200">
        <div className="absolute inset-x-0 -top-12 h-20 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 blur-3xl opacity-20 rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center">
            <Image
              src="/logo_duarte_sem_fundo.png"
              alt="Duarte Urbanismo"
              width={240}
              height={80}
              className="h-auto w-auto max-w-[240px]"
              priority
            />
          </div>
          <div className="text-right">
            <p className="section-label text-slate-500 tracking-[0.35em]">Recibo Oficial</p>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-[0.18em]">RECIBO</h1>
            <div className="mt-4 text-sm text-slate-600 leading-6">
              <p className="font-medium">Nº {data.numero}</p>
              {data.status && (
                <p className={`text-xs font-semibold ${data.status === 'Paga' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  Status: {data.status === 'Paga' ? '✓ PAGA' : '⏳ PENDENTE'}
                </p>
              )}
              {data.dataEmissao && (
                <p className="text-xs text-slate-500">Data de Emissão: {formatarData(data.dataEmissao)}</p>
              )}
              <p className="text-xs text-slate-500">Data de Pagamento/Vencimento: {formatarData(data.data)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valor */}
      <div className="mb-8 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8 text-center shadow-inner">
        <p className="uppercase text-xs tracking-[0.35em] text-amber-600/75 font-semibold mb-3">Valor Recebido</p>
        <p className="text-5xl font-semibold text-slate-900">{formatarMoeda(data.valor)}</p>
        <p className="mt-3 text-sm text-slate-500 uppercase tracking-wide">
          {data.valorExtenso}
        </p>
      </div>

      {/* Dados do Pagador */}
      <div className="mb-8">
        <h3 className="section-label mb-3 text-slate-600">Recebido De</h3>
        <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Nome/Razão Social</p>
            <p className="text-lg font-medium text-slate-900">{data.recebidoDe}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">CPF/CNPJ</p>
            <p className="text-lg font-medium text-slate-900">{formatarCPFCNPJ(data.cpfCnpj)}</p>
          </div>
        </div>
      </div>

      {/* Informações do Empreendimento e Lote */}
      {(data.empreendimentoNome || data.empreendimentoUnidade || data.empreendimentoMetragem || data.numeroLote) && (
        <div className="mb-8">
          <h3 className="section-label mb-3 text-slate-600">Empreendimento</h3>
          <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.empreendimentoNome && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Nome</p>
                <p className="text-lg font-medium text-slate-900">{data.empreendimentoNome}</p>
              </div>
            )}
            {data.numeroLote && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Lote</p>
                <p className="text-lg font-medium text-slate-900">{data.numeroLote}</p>
              </div>
            )}
            {data.empreendimentoUnidade && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Unidade</p>
                <p className="text-lg font-medium text-slate-900">{data.empreendimentoUnidade}</p>
              </div>
            )}
            {data.empreendimentoMetragem && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Metragem</p>
                <p className="text-lg font-medium text-slate-900">{data.empreendimentoMetragem} m²</p>
              </div>
            )}
            {data.empreendimentoFase && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Fase</p>
                <p className="text-lg font-medium text-slate-900">{data.empreendimentoFase}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações da Parcela */}
      {(data.numeroParcela || data.totalParcelas) && (
        <div className="mb-8">
          <h3 className="section-label mb-3 text-slate-600">Parcela</h3>
          <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5">
            <p className="text-lg font-semibold text-slate-900">
              Parcela {data.numeroParcela}{data.totalParcelas ? ` de ${data.totalParcelas}` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Corretor */}
      {(data.corretorNome || data.corretorCreci) && (
        <div className="mb-8">
          <h3 className="section-label mb-3 text-slate-600">Corretor Responsável</h3>
          <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.corretorNome && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Nome</p>
                <p className="text-lg font-medium text-slate-900">{data.corretorNome}</p>
              </div>
            )}
            {data.corretorCreci && (
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">CRECI</p>
                <p className="text-lg font-medium text-slate-900">{data.corretorCreci}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status e Crédito */}
      {data.status && (
        <div className="mb-8">
          <div className={`rounded-2xl border-2 px-6 py-5 ${data.status === 'Paga'
            ? 'border-emerald-200 bg-emerald-50/50'
            : 'border-amber-200 bg-amber-50/50'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Status do Recibo</p>
                <span
                  className={`inline-flex rounded-full px-5 py-2.5 text-base font-bold uppercase tracking-[0.2em] ${data.status === 'Paga'
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-amber-500 text-white shadow-lg'
                    }`}
                >
                  {data.status === 'Paga' ? '✓ PAGO' : '⏳ PENDENTE'}
                </span>
              </div>
              {data.contaParaCredito && (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500 mb-2">Crédito</p>
                  <p className="text-lg font-semibold text-emerald-700">Conta para Crédito</p>
                </div>
              )}
            </div>

            {/* Informações bancárias para recibos pendentes */}
            {data.status === 'Pendente' && (data.bancoNome || data.bancoAgencia || data.bancoConta) && (
              <div className="mt-4 pt-4 border-t border-amber-300">
                <p className="text-xs uppercase tracking-[0.28em] text-amber-700 mb-3 font-semibold">Dados Bancários para Pagamento</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.bancoNome && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-1">Banco</p>
                      <p className="text-sm font-semibold text-slate-900">{data.bancoNome}</p>
                    </div>
                  )}
                  {data.bancoAgencia && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-1">Agência</p>
                      <p className="text-sm font-semibold text-slate-900">{data.bancoAgencia}</p>
                    </div>
                  )}
                  {data.bancoConta && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-1">Conta</p>
                      <p className="text-sm font-semibold text-slate-900">{data.bancoConta}</p>
                    </div>
                  )}
                  {data.bancoTipoConta && (
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-600 mb-1">Tipo</p>
                      <p className="text-sm font-semibold text-slate-900">{data.bancoTipoConta}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referente */}
      <div className="mb-8">
        <h3 className="section-label mb-3 text-slate-600">Referente A</h3>
        <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 text-slate-800 leading-relaxed">
          {data.referente}
        </div>
      </div>

      {/* Forma de Pagamento */}
      <div className="mb-10">
        <h3 className="section-label mb-3 text-slate-600">Forma de Pagamento</h3>
        <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 text-slate-800 font-medium">
          {data.formaPagamento}
        </div>
      </div>

      {/* Footer com QR Code */}
      <div className="pt-10 border-t border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="flex-1 text-left">
            <h3 className="section-label mb-4 text-slate-600 text-left">Emitido Por</h3>
            <div className="space-y-2 text-slate-700 text-left">
              <p className="text-lg font-semibold text-slate-900">{data.emitidoPor}</p>
              {data.emitidoPorNome && (
                <p className="text-sm text-slate-500 italic">Emitido por: {data.emitidoPorNome}</p>
              )}
              <p className="text-sm">CNPJ: {formatarCPFCNPJ(data.cpfEmitente)}</p>
              <p className="text-sm">CEP: {formatarCEP(data.cepEmitente)}</p>
              <p className="text-sm">{data.enderecoEmitente}</p>
              <p className="text-sm">Tel: {data.telefoneEmitente}</p>
              <p className="text-sm">Email: {data.emailEmitente}</p>
            </div>

            <div className="mt-10 text-left">
              <div className="w-full max-w-md border-t border-slate-300 pt-3">
                <p className="text-xs text-left text-slate-500 uppercase tracking-[0.4em] mb-3">
                  Assinatura Corporativa
                </p>
                {hash ? (
                  <div className="mt-3 p-4 bg-slate-50 rounded-lg border-2 border-slate-300">
                    <p className="text-[0.7rem] text-slate-600 uppercase tracking-[0.2em] mb-2 font-semibold">Hash Único de Autenticação</p>
                    <p className="text-xs font-mono text-slate-900 break-all leading-relaxed">{hash}</p>
                    <p className="text-[0.65rem] text-slate-500 mt-2 italic">Este hash garante a autenticidade e integridade deste documento.</p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700">Hash de autenticação não disponível</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* QR Code */}
          {qrCodeData && (
            <div className="text-center">
              <canvas ref={canvasRef} className="mx-auto mb-2"></canvas>
              <p className="text-xs text-gray-500">Código de Verificação</p>
            </div>
          )}
        </div>
        {/* QR Code PIX - apenas para recibos pendentes */}
        {data.status === 'Pendente' && pixPayload && (
          <div className="mt-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-4 text-slate-700 shadow-lg">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-emerald-700 mb-3">Pagamento via PIX</p>
            <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="text-center">
                <canvas ref={pixCanvasRef} className="mx-auto mb-2 rounded-lg bg-white p-2 shadow-md" />
                <p className="text-xs font-semibold text-emerald-700">Escaneie para pagar</p>
              </div>
              <div className="flex-1 text-left text-sm">
                {pixKey && (
                  <p className="text-xs text-emerald-700 mb-2">
                    <span className="font-semibold uppercase tracking-[0.2em]">Chave PIX:</span> <span className="font-bold text-base">{pixKey}</span>
                  </p>
                )}
                <p className="text-xs text-emerald-600 mb-2 font-semibold uppercase tracking-[0.2em]">Código PIX Copia e Cola:</p>
                <pre className="mt-2 whitespace-pre-wrap wrap-break-word rounded-xl bg-white/90 p-3 text-xs text-emerald-700 border border-emerald-200">
                  {pixPayload}
                </pre>
                <PixCopyButton
                  payload={pixPayload}
                  className="mt-3 inline-flex items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.35em] text-white hover:bg-emerald-600 shadow-md"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nota de autenticidade */}
      <div className="mt-10 rounded-2xl bg-slate-50/70 px-6 py-4 text-xs text-slate-500 text-center leading-relaxed">
        <p>
          Este recibo segue o padrão Duarte Urbanismo LTDA, com assinatura digital e validação pública via QR Code. Guarde-o para fins jurídicos e de governança.
        </p>
      </div>

      {/* Nota de Verificação */}
      <div className="mt-6 rounded-xl border-2 border-slate-300 bg-slate-100/80 px-6 py-4 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-700 mb-2">
          Nota de Verificação
        </p>
        <p className="text-xs text-slate-600 font-mono">
          Documento verificado em: {formatarDataHoraCompleta()}
        </p>
        <p className="text-[0.65rem] text-slate-500 mt-2 italic">
          Esta data e hora servem para autenticar a consulta deste documento no sistema.
        </p>
      </div>

      {/* Botões de Ação */}
      {(onPrint || onGeneratePDF) && (
        <div className="no-print mt-8 flex flex-wrap gap-4 justify-center">
          {onPrint && (
            <button
              onClick={onPrint}
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-slate-700"
            >
              🖨️ Imprimir
            </button>
          )}
          {onGeneratePDF && (
            <button
              onClick={onGeneratePDF}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-slate-900 transition hover:bg-amber-400"
            >
              📄 Gerar PDF
            </button>
          )}
        </div>
      )}
    </div>
  );
}


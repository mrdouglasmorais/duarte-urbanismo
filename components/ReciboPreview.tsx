'use client';

import { formatarCPFCNPJ, formatarData, formatarMoeda } from '@/lib/utils';
import { ReciboData } from '@/types/recibo';
import QRCode from 'qrcode';
import { useEffect, useRef, useState, startTransition } from 'react';
import Logo from './Logo';
import PixCopyButton from './PixCopyButton';

interface ReciboPreviewProps {
  data: ReciboData;
  qrCodeData?: string;
}

export default function ReciboPreview({ data, qrCodeData }: ReciboPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixCanvasRef = useRef<HTMLCanvasElement>(null);
  const [pixPayload, setPixPayload] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);

  useEffect(() => {
    if (qrCodeData && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrCodeData, {
        width: 120,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => console.error('Erro ao gerar QR Code:', err));
      try {
        const parsed = JSON.parse(qrCodeData);
        startTransition(() => {
          setPixPayload(typeof parsed?.pixPayload === 'string' ? parsed.pixPayload : null);
          setPixKey(typeof parsed?.pixKey === 'string' ? parsed.pixKey : null);
        });
      } catch {
        startTransition(() => {
          setPixPayload(null);
          setPixKey(null);
        });
      }
    }
  }, [qrCodeData]);

  useEffect(() => {
    if (pixPayload && pixCanvasRef.current) {
      QRCode.toCanvas(pixCanvasRef.current, pixPayload, {
        width: 120,
        margin: 1,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      }).catch(err => console.error('Erro ao gerar QR Code PIX:', err));
    }
  }, [pixPayload]);

  return (
    <div
      id="recibo-preview"
      className="w-full max-w-4xl mx-auto bg-white/95 p-12 shadow-[0_25px_60px_rgba(15,23,42,0.18)] rounded-[2.75rem] border border-slate-200/60"
    >
      {/* Header */}
      <div className="relative mb-10 pb-8 border-b border-slate-200">
        <div className="absolute inset-x-0 -top-12 h-20 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 blur-3xl opacity-20 rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <Logo width={240} />
          <div className="text-right">
            <p className="section-label text-slate-500 tracking-[0.35em]">Recibo Oficial</p>
            <h1 className="text-4xl font-semibold text-slate-900 tracking-[0.18em]">RECIBO</h1>
            <div className="mt-4 text-sm text-slate-600 leading-6">
              <p className="font-medium">Nº {data.numero}</p>
              <p>{formatarData(data.data)}</p>
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
          <div className="flex-1">
            <h3 className="section-label mb-4 text-slate-600">Emitido Por</h3>
            <div className="space-y-2 text-slate-700">
              <p className="text-lg font-semibold text-slate-900">{data.emitidoPor}</p>
              <p className="text-sm">CNPJ: {formatarCPFCNPJ(data.cpfEmitente)}</p>
              <p className="text-sm">{data.enderecoEmitente}</p>
              <p className="text-sm">Tel: {data.telefoneEmitente}</p>
              <p className="text-sm">Email: {data.emailEmitente}</p>
            </div>

            <div className="mt-10">
              <div className="w-64 border-t border-slate-300 pt-3">
                <p className="text-xs text-center text-slate-500 uppercase tracking-[0.4em]">
                  Assinatura Corporativa
                </p>
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
        {pixPayload && (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-slate-700">
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-700">Pagamento PIX</p>
            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="text-center">
                <canvas ref={pixCanvasRef} className="mx-auto mb-2 rounded bg-white p-2" />
                <p className="text-[0.65rem] text-emerald-700">Escaneie para pagar</p>
              </div>
              <div className="flex-1 text-left text-sm">
                {pixKey && (
                  <p className="text-xs text-emerald-700">
                    Chave: <span className="font-semibold">{pixKey}</span>
                  </p>
                )}
                <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-white/80 p-3 text-xs text-emerald-700">
                  {pixPayload}
                </pre>
                <PixCopyButton
                  payload={pixPayload}
                  className="mt-3 inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 hover:bg-emerald-100"
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
    </div>
  );
}


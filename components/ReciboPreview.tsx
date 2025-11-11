'use client';

import { ReciboData } from '@/types/recibo';
import { formatarMoeda, formatarData, formatarCPFCNPJ } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import Logo from './Logo';

interface ReciboPreviewProps {
  data: ReciboData;
  qrCodeData?: string;
}

export default function ReciboPreview({ data, qrCodeData }: ReciboPreviewProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    }
  }, [qrCodeData]);

  return (
    <div
      id="recibo-preview"
      className="w-full max-w-4xl mx-auto bg-white p-8 shadow-lg"
      style={{ fontFamily: 'Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="border-b-4 border-gray-300 pb-6 mb-6">
        {/* Logo da Empresa */}
        <div className="mb-4">
          <Logo width={250} />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          RECIBO
        </h1>
        <div className="text-right text-sm text-gray-600">
          <p>Nº {data.numero}</p>
          <p>{formatarData(data.data)}</p>
        </div>
      </div>

      {/* Valor */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Valor</p>
          <p className="text-4xl font-bold text-blue-600">
            {formatarMoeda(data.valor)}
          </p>
          <p className="text-xs text-gray-500 mt-2 italic">
            ({data.valorExtenso})
          </p>
        </div>
      </div>

      {/* Dados do Pagador */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
          RECEBIDO DE
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Nome/Razão Social</p>
            <p className="font-medium text-gray-800">{data.recebidoDe}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">CPF/CNPJ</p>
            <p className="font-medium text-gray-800">{formatarCPFCNPJ(data.cpfCnpj)}</p>
          </div>
        </div>
      </div>

      {/* Referente */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
          REFERENTE A
        </h3>
        <p className="text-gray-800">{data.referente}</p>
      </div>

      {/* Forma de Pagamento */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-1">
          FORMA DE PAGAMENTO
        </h3>
        <p className="text-gray-800">{data.formaPagamento}</p>
      </div>

      {/* Footer com QR Code */}
      <div className="mt-8 pt-6 border-t-2 border-gray-300">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              EMITIDO POR
            </h3>
            <p className="font-semibold text-gray-800">{data.emitidoPor}</p>
            <p className="text-sm text-gray-600">CPF: {formatarCPFCNPJ(data.cpfEmitente)}</p>
            <p className="text-sm text-gray-600">{data.enderecoEmitente}</p>
            <p className="text-sm text-gray-600">Tel: {data.telefoneEmitente}</p>
            <p className="text-sm text-gray-600">Email: {data.emailEmitente}</p>

            <div className="mt-8">
              <div className="border-t border-gray-400 w-64 pt-2">
                <p className="text-xs text-center text-gray-600">Assinatura do Emitente</p>
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
      </div>

      {/* Nota de autenticidade */}
      <div className="mt-6 p-3 bg-gray-50 rounded text-xs text-gray-500 text-center">
        <p>
          Este recibo possui validade jurídica e comprova o pagamento realizado.
          Guarde-o para fins de comprovação e controle financeiro.
        </p>
      </div>
    </div>
  );
}


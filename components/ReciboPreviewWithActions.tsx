'use client';

import { ReciboData } from '@/types/recibo';
import ReciboPreview from './ReciboPreview';

interface ReciboPreviewWithActionsProps {
  data: ReciboData;
  qrCodeData?: string;
  baseUrl?: string;
}

export default function ReciboPreviewWithActions({ data, qrCodeData, baseUrl }: ReciboPreviewWithActionsProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleGeneratePDF = async () => {
    if (!baseUrl) {
      console.error('Base URL não disponível');
      alert('Erro: URL base não configurada. Tente novamente.');
      return;
    }

    if (!data || !data.numero) {
      alert('Dados do recibo incompletos. Não é possível gerar o PDF.');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/gerar-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let errorMessage = 'Erro desconhecido ao gerar PDF';
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.errors?.join(', ') || errorText;
            } catch {
              errorMessage = errorText || `Erro HTTP ${response.status}`;
            }
          } else {
            errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
          }
        } catch (parseError) {
          console.error('Erro ao parsear resposta de erro:', parseError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      try {
        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new Error('PDF vazio recebido');
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recibo-${data.numero || 'recibo'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (blobError) {
        console.error('Erro ao processar PDF:', blobError);
        alert('Erro ao processar o arquivo PDF. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro ao gerar PDF: ${errorMsg}. Por favor, tente novamente.`);
    }
  };

  return (
    <ReciboPreview
      data={data}
      qrCodeData={qrCodeData}
      onPrint={handlePrint}
      onGeneratePDF={handleGeneratePDF}
    />
  );
}


import { buildQrCodePayload, buildShareUrl, generateReciboHash } from '@/lib/authenticity';
import { APP_BASE_URL } from '@/lib/constants';
import { drawLogoPDF } from '@/lib/logo-pdf';
import { drawHabitvsLogoPDF } from '@/lib/habitvs-logo-pdf';
import type { ReciboPayload } from '@/lib/recibos';
import { sanitizeReciboData, validateReciboData } from '@/lib/recibos';
import { saveRecibo } from '@/lib/recibos-repository';
import { formatarCEP, formatarCPFCNPJ, formatarData, formatarDataHoraCompleta, formatarMoeda } from '@/lib/utils';
import type { ReciboData } from '@/types/recibo';
import { jsPDF } from 'jspdf';
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

interface QrOptionsPayload {
  pixPayload?: unknown;
  pixKey?: unknown;
}

export async function POST(request: NextRequest) {
  try {
    let raw: Record<string, unknown>;
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch (error) {
      console.error('Erro ao parsear JSON da requisição:', error);
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }

    const qrOptions = (raw?.qrOptions ?? {}) as QrOptionsPayload;
    const pixPayload = typeof qrOptions?.pixPayload === 'string' ? qrOptions.pixPayload.trim() : undefined;
    const pixKey = typeof qrOptions?.pixKey === 'string' ? qrOptions.pixKey.trim() : undefined;

    let data: ReciboData;
    try {
      data = sanitizeReciboData(raw as ReciboPayload);
      if (pixPayload) {
        data.pixPayload = pixPayload;
      }
      if (pixKey) {
        data.pixKey = pixKey;
      }
    } catch (error) {
      console.error('Erro ao sanitizar dados do recibo:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao processar dados do recibo' },
        { status: 400 }
      );
    }

    const validationErrors = validateReciboData(data);
    if (validationErrors.length > 0) {
      console.error('Erros de validação:', validationErrors);
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    let hash: string;
    let shareId: string;
    try {
      hash = generateReciboHash(data);
      const origin = request.headers.get('origin') ?? APP_BASE_URL;
      const saveResult = await saveRecibo(data, hash);
      shareId = saveResult.shareId;
    } catch (error) {
      console.error('Erro ao salvar recibo no banco:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao salvar recibo no banco de dados' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') ?? APP_BASE_URL;
    const qrPayload = buildQrCodePayload(data, hash, origin, shareId, { pixPayload, pixKey });

    // Gerar QR Code de Verificação
    let qrCodeDataUrl: string;
    try {
      const qrCodeDataString = JSON.stringify(qrPayload);
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeDataString, {
        width: 120,
        margin: 1
      });
    } catch (error) {
      console.error('Erro ao gerar QR Code de verificação:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar código QR de verificação' },
        { status: 500 }
      );
    }

    // Gerar QR Code PIX se disponível (sempre para parcelas pendentes)
    let pixQrCodeDataUrl: string | null = null;
    if (pixPayload) {
      try {
        pixQrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
          width: 120,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Erro ao gerar QR Code PIX:', error);
      }
    }

    // Criar PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Desenhar logo
    let yPos: number;
    try {
      yPos = drawLogoPDF(pdf, pageWidth / 2, 15);
      if (typeof yPos !== 'number' || isNaN(yPos)) {
        yPos = 30; // Fallback se drawLogoPDF retornar valor inválido
      }
    } catch (logoError) {
      console.error('Erro ao desenhar logo:', logoError);
      yPos = 30; // Posição padrão se o logo falhar
    }

    // Título RECIBO
    yPos += 10;
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIBO', pageWidth / 2, yPos, { align: 'center' });

    // Número, Status e Datas
    yPos += 5;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nº ${data.numero}`, pageWidth - margin, yPos - 5, { align: 'right' });

    if (data.status) {
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(data.status === 'Paga' ? 34 : 217, data.status === 'Paga' ? 197 : 119, data.status === 'Paga' ? 94 : 70);
      pdf.text(`Status: ${data.status === 'Paga' ? 'PAGA' : 'PENDENTE'}`, pageWidth - margin, yPos, { align: 'right' });
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
      yPos += 5;
    }

    if (data.dataEmissao) {
      pdf.text(`Data de Emissão: ${formatarData(data.dataEmissao)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 5;
    }
    pdf.text(`Data de Pagamento/Vencimento: ${formatarData(data.data)}`, pageWidth - margin, yPos, { align: 'right' });

    // Linha separadora
    yPos += 5;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    // Box do Valor
    yPos += 10;
    pdf.setFillColor(239, 246, 255); // blue-50
    pdf.setDrawColor(191, 219, 254); // blue-200
    pdf.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'FD');

    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Valor', pageWidth / 2, yPos + 8, { align: 'center' });

    pdf.setFontSize(24);
    pdf.setTextColor(37, 99, 235);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatarMoeda(data.valor), pageWidth / 2, yPos + 18, { align: 'center' });

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`(${data.valorExtenso})`, pageWidth / 2, yPos + 25, { align: 'center' });

    // Recebido de
    yPos += 40;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECEBIDO DE', margin, yPos);

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Nome/Razão Social', margin, yPos);
    pdf.text('CPF/CNPJ', margin + contentWidth / 2, yPos);

    yPos += 5;
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.recebidoDe, margin, yPos);
    pdf.text(formatarCPFCNPJ(data.cpfCnpj), margin + contentWidth / 2, yPos);

    // Informações do Empreendimento e Lote
    if (data.empreendimentoNome || data.empreendimentoUnidade || data.empreendimentoMetragem || data.numeroLote) {
      yPos += 15;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EMPREENDIMENTO', margin, yPos);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

      yPos += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      const empreendimentoInfo: string[] = [];
      if (data.empreendimentoNome) empreendimentoInfo.push(`Nome: ${data.empreendimentoNome}`);
      if (data.numeroLote) empreendimentoInfo.push(`Lote: ${data.numeroLote}`);
      if (data.empreendimentoUnidade) empreendimentoInfo.push(`Unidade: ${data.empreendimentoUnidade}`);
      if (data.empreendimentoMetragem) empreendimentoInfo.push(`Metragem: ${data.empreendimentoMetragem} m²`);
      if (data.empreendimentoFase) empreendimentoInfo.push(`Fase: ${data.empreendimentoFase}`);
      pdf.text(empreendimentoInfo.join(' | '), margin, yPos);
    }

    // Informações da Parcela
    if (data.numeroParcela || data.totalParcelas) {
      yPos += 12;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARCELA', margin, yPos);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

      yPos += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'bold');
      const parcelaText = `Parcela ${data.numeroParcela}${data.totalParcelas ? ` de ${data.totalParcelas}` : ''}`;
      pdf.text(parcelaText, margin, yPos);
    }

    // Corretor
    if (data.corretorNome || data.corretorCreci) {
      yPos += 12;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CORRETOR RESPONSÁVEL', margin, yPos);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

      yPos += 8;
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      const corretorInfo: string[] = [];
      if (data.corretorNome) corretorInfo.push(`Nome: ${data.corretorNome}`);
      if (data.corretorCreci) corretorInfo.push(`CRECI: ${data.corretorCreci}`);
      pdf.text(corretorInfo.join(' | '), margin, yPos);
    }

    // Status e Informações Bancárias
    if (data.status) {
      yPos += 12;
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STATUS DO RECIBO', margin, yPos);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

      yPos += 8;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      if (data.status === 'Paga') {
        pdf.setTextColor(34, 197, 94); // emerald-600
        pdf.text('✓ PAGO', margin, yPos);
      } else {
        pdf.setTextColor(217, 119, 6); // amber-600
        pdf.text('⏳ PENDENTE', margin, yPos);
      }

      if (data.contaParaCredito) {
        yPos += 6;
        pdf.setFontSize(9);
        pdf.setTextColor(34, 197, 94); // emerald-600
        pdf.text('CONTA PARA CRÉDITO', margin, yPos);
      }

      // Informações bancárias para recibos pendentes
      if (data.status === 'Pendente' && (data.bancoNome || data.bancoAgencia || data.bancoConta)) {
        yPos += 10;
        pdf.setDrawColor(217, 119, 6); // amber-600
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 6;
        pdf.setFontSize(9);
        pdf.setTextColor(217, 119, 6); // amber-600
        pdf.setFont('helvetica', 'bold');
        pdf.text('DADOS BANCÁRIOS PARA PAGAMENTO', margin, yPos);

        yPos += 6;
        pdf.setFontSize(8);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'normal');
        const bancoInfo: string[] = [];
        if (data.bancoNome) bancoInfo.push(`Banco: ${data.bancoNome}`);
        if (data.bancoAgencia) bancoInfo.push(`Agência: ${data.bancoAgencia}`);
        if (data.bancoConta) bancoInfo.push(`Conta: ${data.bancoConta}`);
        if (data.bancoTipoConta) bancoInfo.push(`Tipo: ${data.bancoTipoConta}`);
        if (bancoInfo.length > 0) {
          pdf.text(bancoInfo.join(' | '), margin, yPos);
        }
      }
    }

    // Referente a
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REFERENTE A', margin, yPos);

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

    yPos += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    const referenteLines = pdf.splitTextToSize(data.referente, contentWidth);
    pdf.text(referenteLines, margin, yPos);

    // Forma de Pagamento
    yPos += (referenteLines.length * 5) + 10;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FORMA DE PAGAMENTO', margin, yPos);

    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPos + 1, pageWidth - margin, yPos + 1);

    yPos += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.formaPagamento, margin, yPos);

    // Footer - Emitido por e QR Code
    yPos = pageHeight - 80;
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    yPos += 8;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EMITIDO POR', margin, yPos);

    yPos += 6;
    pdf.setFontSize(10);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.emitidoPor, margin, yPos);

    if (data.emitidoPorNome) {
      yPos += 5;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Emitido por: ${data.emitidoPorNome}`, margin, yPos);
    }

    yPos += 5;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Doc.: ${formatarCPFCNPJ(data.cpfEmitente)}`, margin, yPos);

    yPos += 5;
    pdf.text(`CEP: ${formatarCEP(data.cepEmitente)}`, margin, yPos);

    yPos += 5;
    pdf.text(data.enderecoEmitente, margin, yPos);

    yPos += 5;
    pdf.text(`Tel: ${data.telefoneEmitente}`, margin, yPos);

    yPos += 5;
    pdf.text(`Email: ${data.emailEmitente}`, margin, yPos);

    // Assinatura Digital com Hash
    yPos += 15;
    pdf.setDrawColor(150, 150, 150);
    pdf.line(margin, yPos, margin + 80, yPos);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ASSINATURA CORPORATIVA', margin + 40, yPos + 4, { align: 'center' });

    // Hash sempre está disponível (foi gerado acima)
    yPos += 10;
    pdf.setFontSize(6);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('HASH ÚNICO DE AUTENTICAÇÃO:', margin, yPos);
    yPos += 5;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(5);
    pdf.setTextColor(40, 40, 40);
    const hashLines = pdf.splitTextToSize(hash, 80);
    pdf.text(hashLines, margin, yPos);
    yPos += (hashLines.length * 3) + 3;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(4);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Este hash garante a autenticidade e integridade deste documento.', margin, yPos);
    pdf.setFont('helvetica', 'normal');

    // QR Code de Verificação
    const qrSize = 35;
    const qrX = pageWidth - margin - qrSize;
    const qrY = pageHeight - 75;
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Código de Verificação', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });

    // QR Code PIX (apenas para recibos pendentes)
    if (data.status === 'Pendente' && pixQrCodeDataUrl) {
      const pixQrSize = 40;
      const pixQrX = margin;
      const pixQrY = pageHeight - 100;

      // Box destacado para PIX
      pdf.setFillColor(236, 253, 245); // emerald-50
      pdf.setDrawColor(16, 185, 129); // emerald-600
      pdf.setLineWidth(1);
      pdf.roundedRect(pixQrX - 5, pixQrY - 8, pixQrSize + 10, pixQrSize + 35, 2, 2, 'FD');

      pdf.addImage(pixQrCodeDataUrl, 'PNG', pixQrX, pixQrY, pixQrSize, pixQrSize);

      pdf.setFontSize(7);
      pdf.setTextColor(16, 185, 129); // emerald-600
      pdf.setFont('helvetica', 'bold');
      pdf.text('PIX - Escaneie para pagar', pixQrX + (pixQrSize / 2), pixQrY + pixQrSize + 4, { align: 'center' });

      if (pixKey) {
        pdf.setFontSize(6);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Chave: ${pixKey}`, pixQrX + (pixQrSize / 2), pixQrY + pixQrSize + 8, { align: 'center' });
      }

      // Código PIX Copia e Cola
      if (pixPayload) {
        yPos = pixQrY + pixQrSize + 15;
        pdf.setFontSize(5);
        pdf.setTextColor(16, 185, 129); // emerald-600
        pdf.setFont('helvetica', 'bold');
        pdf.text('Código PIX Copia e Cola:', margin + pixQrSize + 15, yPos);

        yPos += 4;
        pdf.setFontSize(4);
        pdf.setFont('courier', 'normal');
        pdf.setTextColor(40, 40, 40);
        const pixLines = pdf.splitTextToSize(pixPayload, contentWidth - pixQrSize - 25);
        pdf.text(pixLines, margin + pixQrSize + 15, yPos);
      }
    }

    // Nota de rodapé
    yPos = pageHeight - 35;
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(margin, yPos, contentWidth, 15, 2, 2, 'F');

    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    const nota = 'Este recibo possui validade jurídica e comprova o pagamento realizado. Guarde-o para fins de comprovação e controle financeiro.';
    const notaLines = pdf.splitTextToSize(nota, contentWidth - 4);
    pdf.text(notaLines, pageWidth / 2, yPos + 4, { align: 'center' });

    // Nota de Verificação
    yPos = pageHeight - 18;
    pdf.setFillColor(240, 240, 240);
    pdf.setDrawColor(150, 150, 150);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'FD');

    pdf.setFontSize(6);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTA DE VERIFICAÇÃO', pageWidth / 2, yPos + 4, { align: 'center' });

    pdf.setFontSize(5);
    pdf.setFont('courier', 'normal');
    pdf.setTextColor(60, 60, 60);
    const dataHoraVerificacao = formatarDataHoraCompleta();
    pdf.text(`Documento verificado em: ${dataHoraVerificacao}`, pageWidth / 2, yPos + 7, { align: 'center' });

    pdf.setFontSize(4);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Esta data e hora servem para autenticar a consulta deste documento no sistema.', pageWidth / 2, yPos + 10, { align: 'center' });

    // Adicionar logo Habitvs no rodapé
    drawHabitvsLogoPDF(pdf, pageWidth, pageHeight, margin);

    // Gerar PDF como Buffer
    let pdfBuffer: Buffer;
    try {
      const pdfOutput = pdf.output('arraybuffer');
      if (!pdfOutput || pdfOutput.byteLength === 0) {
        throw new Error('PDF gerado está vazio');
      }
      pdfBuffer = Buffer.from(pdfOutput);
      if (pdfBuffer.length === 0) {
        throw new Error('Buffer do PDF está vazio');
      }
    } catch (error) {
      console.error('Erro ao gerar buffer do PDF:', error);
      throw new Error(`Erro ao gerar arquivo PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    const shareUrl = buildShareUrl(shareId, origin);

    const response = new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${data.numero}.pdf"`,
        'x-recibo-share-id': shareId,
        'x-recibo-share-url': shareUrl
      }
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar PDF';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorString = error instanceof Error ? error.toString() : String(error);

    // Log detalhado no servidor
    console.error('❌ Erro ao gerar PDF:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      string: errorString,
      timestamp: new Date().toISOString(),
      type: typeof error,
      isError: error instanceof Error
    });

    // Retornar resposta JSON com detalhes
    const errorResponse = {
      error: errorMessage,
      errorType: errorName,
      errorString: errorString,
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      timestamp: new Date().toISOString()
    };

    console.error('📤 Enviando resposta de erro:', JSON.stringify(errorResponse, null, 2));

    return NextResponse.json(
      errorResponse,
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Type': errorName
        }
      }
    );
  }
}

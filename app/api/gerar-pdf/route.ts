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

    // Layout otimizado para uma única página - sem quebra de página automática

    // Desenhar logo (muito compacto)
    let yPos: number;
    try {
      yPos = drawLogoPDF(pdf, pageWidth / 2, 8);
      if (typeof yPos !== 'number' || isNaN(yPos)) {
        yPos = 18; // Fallback se drawLogoPDF retornar valor inválido
      }
    } catch (logoError) {
      console.error('Erro ao desenhar logo:', logoError);
      yPos = 18; // Posição padrão se o logo falhar
    }

    // Título RECIBO (reduzido)
    yPos += 2;
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIBO', pageWidth / 2, yPos, { align: 'center' });

    // Número, Status e Datas (compacto)
    yPos += 4;
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    let headerInfoY = yPos - 4;
    pdf.text(`Nº ${data.numero}`, pageWidth - margin, headerInfoY, { align: 'right' });

    if (data.status) {
      headerInfoY += 3.5;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(data.status === 'Paga' ? 34 : 217, data.status === 'Paga' ? 197 : 119, data.status === 'Paga' ? 94 : 70);
      pdf.text(`Status: ${data.status === 'Paga' ? 'PAGA' : 'PENDENTE'}`, pageWidth - margin, headerInfoY, { align: 'right' });
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'normal');
    }

    if (data.dataEmissao) {
      headerInfoY += 3.5;
      pdf.text(`Data de Emissão: ${formatarData(data.dataEmissao)}`, pageWidth - margin, headerInfoY, { align: 'right' });
    }
    headerInfoY += 3.5;
    pdf.text(`Data de Pagamento/Vencimento: ${formatarData(data.data)}`, pageWidth - margin, headerInfoY, { align: 'right' });

    // Linha separadora
    yPos += 4;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);

    // Box do Valor (muito reduzido e sutil)
    yPos += 4;
    pdf.setFillColor(249, 250, 251); // gray-50 mais sutil
    pdf.setDrawColor(229, 231, 235); // gray-200 mais sutil
    pdf.roundedRect(margin, yPos, contentWidth, 12, 1.5, 1.5, 'FD');

    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.text('Valor', pageWidth / 2, yPos + 4, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setTextColor(37, 99, 235);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formatarMoeda(data.valor), pageWidth / 2, yPos + 9, { align: 'center' });

    pdf.setFontSize(6);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`(${data.valorExtenso})`, pageWidth / 2, yPos + 11.5, { align: 'center' });

    // Recebido de
    yPos += 4;
    pdf.setFontSize(8.5);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECEBIDO DE', margin, yPos);

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

    yPos += 4;
    pdf.setFontSize(7.5);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Nome/Razão Social', margin, yPos);
    pdf.text('CPF/CNPJ', margin + contentWidth / 2, yPos);

    yPos += 3.5;
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    const recebidoDeLines = pdf.splitTextToSize(data.recebidoDe, contentWidth / 2 - 5);
    const cpfCnpjLines = pdf.splitTextToSize(formatarCPFCNPJ(data.cpfCnpj), contentWidth / 2 - 5);
    const maxLines = Math.max(recebidoDeLines.length, cpfCnpjLines.length);

    pdf.text(recebidoDeLines, margin, yPos);
    pdf.text(cpfCnpjLines, margin + contentWidth / 2, yPos);
    yPos += (maxLines * 3.5);

    // Informações do Empreendimento e Lote
    if (data.empreendimentoNome || data.empreendimentoUnidade || data.empreendimentoMetragem || data.numeroLote) {
      yPos += 4;
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EMPREENDIMENTO', margin, yPos);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

      yPos += 4;
      pdf.setFontSize(7.5);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      const empreendimentoInfo: string[] = [];
      if (data.empreendimentoNome) empreendimentoInfo.push(`Nome: ${data.empreendimentoNome}`);
      if (data.numeroLote) empreendimentoInfo.push(`Lote: ${data.numeroLote}`);
      if (data.empreendimentoUnidade) empreendimentoInfo.push(`Unidade: ${data.empreendimentoUnidade}`);
      if (data.empreendimentoMetragem) empreendimentoInfo.push(`Metragem: ${data.empreendimentoMetragem} m²`);
      if (data.empreendimentoFase) empreendimentoInfo.push(`Fase: ${data.empreendimentoFase}`);
      const empreendimentoText = empreendimentoInfo.join(' | ');
      const empreendimentoLines = pdf.splitTextToSize(empreendimentoText, contentWidth);
      pdf.text(empreendimentoLines, margin, yPos);
      yPos += (empreendimentoLines.length * 3.5);
    }

    // Informações da Parcela
    if (data.numeroParcela || data.totalParcelas) {
      yPos += 4;
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARCELA', margin, yPos);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

      yPos += 4;
      pdf.setFontSize(8.5);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'bold');
      const parcelaText = `Parcela ${data.numeroParcela}${data.totalParcelas ? ` de ${data.totalParcelas}` : ''}`;
      pdf.text(parcelaText, margin, yPos);
      yPos += 4;
    }

    // Corretor
    if (data.corretorNome || data.corretorCreci) {
      yPos += 4;
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('CORRETOR RESPONSÁVEL', margin, yPos);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

      yPos += 4;
      pdf.setFontSize(7.5);
      pdf.setTextColor(40, 40, 40);
      pdf.setFont('helvetica', 'normal');
      const corretorInfo: string[] = [];
      if (data.corretorNome) corretorInfo.push(`Nome: ${data.corretorNome}`);
      if (data.corretorCreci) corretorInfo.push(`CRECI: ${data.corretorCreci}`);
      const corretorText = corretorInfo.join(' | ');
      const corretorLines = pdf.splitTextToSize(corretorText, contentWidth);
      pdf.text(corretorLines, margin, yPos);
      yPos += (corretorLines.length * 3.5);
    }

    // Status e Informações Bancárias
    if (data.status) {
      yPos += 4;
      pdf.setFontSize(8.5);
      pdf.setTextColor(60, 60, 60);
      pdf.setFont('helvetica', 'bold');
      pdf.text('STATUS DO RECIBO', margin, yPos);

      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

      yPos += 4;
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      if (data.status === 'Paga') {
        pdf.setTextColor(34, 197, 94); // emerald-600
        pdf.text('✓ PAGO', margin, yPos);
      } else {
        pdf.setTextColor(217, 119, 6); // amber-600
        pdf.text('⏳ PENDENTE', margin, yPos);
      }

      if (data.contaParaCredito) {
        yPos += 4;
        pdf.setFontSize(7.5);
        pdf.setTextColor(34, 197, 94); // emerald-600
        pdf.text('CONTA PARA CRÉDITO', margin, yPos);
      }

      // Informações bancárias para recibos pendentes
      if (data.status === 'Pendente' && (data.bancoNome || data.bancoAgencia || data.bancoConta)) {
        yPos += 4;
        pdf.setDrawColor(217, 119, 6); // amber-600
        pdf.setLineWidth(0.3);
        pdf.line(margin, yPos, pageWidth - margin, yPos);

        yPos += 4;
        pdf.setFontSize(7.5);
        pdf.setTextColor(217, 119, 6); // amber-600
        pdf.setFont('helvetica', 'bold');
        pdf.text('DADOS BANCÁRIOS PARA PAGAMENTO', margin, yPos);

        yPos += 4;
        pdf.setFontSize(6.5);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'normal');
        const bancoInfo: string[] = [];
        if (data.bancoNome) bancoInfo.push(`Banco: ${data.bancoNome}`);
        if (data.bancoAgencia) bancoInfo.push(`Agência: ${data.bancoAgencia}`);
        if (data.bancoConta) bancoInfo.push(`Conta: ${data.bancoConta}`);
        if (data.bancoTipoConta) bancoInfo.push(`Tipo: ${data.bancoTipoConta}`);
        if (bancoInfo.length > 0) {
          const bancoText = bancoInfo.join(' | ');
          const bancoLines = pdf.splitTextToSize(bancoText, contentWidth);
          pdf.text(bancoLines, margin, yPos);
          yPos += (bancoLines.length * 3.5);
        }
      } else {
        yPos += 3;
      }
    }

    // Referente a
    yPos += 4;
    pdf.setFontSize(8.5);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('REFERENTE A', margin, yPos);

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

    yPos += 4;
    pdf.setFontSize(7.5);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    const referenteLines = pdf.splitTextToSize(data.referente, contentWidth);
    pdf.text(referenteLines, margin, yPos);
    yPos += (referenteLines.length * 3.5) + 3; // Calcular espaço após referente

    // Forma de Pagamento
    yPos += 3;
    pdf.setFontSize(8.5);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FORMA DE PAGAMENTO', margin, yPos);

    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.2);
    pdf.line(margin, yPos + 0.5, pageWidth - margin, yPos + 0.5);

    yPos += 4;
    pdf.setFontSize(7.5);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'normal');
    const formaPagamentoLines = pdf.splitTextToSize(data.formaPagamento, contentWidth);
    pdf.text(formaPagamentoLines, margin, yPos);
    yPos += (formaPagamentoLines.length * 3.5) + 4; // Espaço após forma de pagamento

    // Footer - Layout compacto para uma única página
    // Espaço necessário reduzido: ~75mm (emitido por + assinatura + hash + QR codes + notas)
    const footerSpaceNeeded = 75;
    const minFooterY = pageHeight - footerSpaceNeeded;

    // Adicionar espaço mínimo antes do footer
    yPos += 3;

    // Garantir que o footer comece em uma posição adequada sem sobreposição
    let footerStartY = Math.max(yPos, minFooterY - 3);

    // Se o conteúdo principal está muito próximo do footer, ajustar
    if (yPos > minFooterY - 3) {
      footerStartY = minFooterY - 3;
    }

    // Linha separadora do footer (mais sutil)
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.3);
    pdf.line(margin, footerStartY, pageWidth - margin, footerStartY);

    // Calcular posição dos QR Codes (lado direito) - tamanho reduzido
    const qrSize = 22; // Reduzido para evitar sobreposição
    const qrX = pageWidth - margin - qrSize;
    // Posicionar QR Code no início do footer
    const qrY = footerStartY + 0.5;

    // QR Code de Verificação (sempre no canto superior direito do footer)
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
    pdf.setFontSize(5);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Código de Verificação', qrX + (qrSize / 2), qrY + qrSize + 2, { align: 'center' });

    // Seção "EMITIDO POR" - lado esquerdo do footer (compacto)
    // Garantir que não sobreponha o QR Code (qrY + qrSize + 2 + 2 = qrY + qrSize + 4)
    let emitidoPorY = Math.max(footerStartY + 3, qrY + qrSize + 4);
    pdf.setFontSize(7);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EMITIDO POR', margin, emitidoPorY);

    emitidoPorY += 3.5;
    pdf.setFontSize(7);
    pdf.setTextColor(40, 40, 40);
    pdf.setFont('helvetica', 'bold');
    const emitidoPorLines = pdf.splitTextToSize(data.emitidoPor, contentWidth / 2 - 20);
    pdf.text(emitidoPorLines, margin, emitidoPorY);
    emitidoPorY += (emitidoPorLines.length * 2.8) + 1.5;

    if (data.emitidoPorNome) {
      emitidoPorY += 2;
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Emitido por: ${data.emitidoPorNome}`, margin, emitidoPorY);
    }

    emitidoPorY += 2.5;
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`Doc.: ${formatarCPFCNPJ(data.cpfEmitente)}`, margin, emitidoPorY);

    emitidoPorY += 2.5;
    pdf.text(`CEP: ${formatarCEP(data.cepEmitente)}`, margin, emitidoPorY);

    emitidoPorY += 2.5;
    const enderecoLines = pdf.splitTextToSize(data.enderecoEmitente, contentWidth / 2 - 20);
    pdf.text(enderecoLines, margin, emitidoPorY);
    emitidoPorY += (enderecoLines.length * 2.8);

    emitidoPorY += 2.5;
    pdf.text(`Tel: ${data.telefoneEmitente}`, margin, emitidoPorY);

    emitidoPorY += 2.5;
    pdf.text(`Email: ${data.emailEmitente}`, margin, emitidoPorY);

    // Atualizar yPos para o próximo elemento
    yPos = emitidoPorY;

    // QR Code PIX (apenas para recibos pendentes) - lado esquerdo do footer (compacto)
    const notaRodapeY = pageHeight - 24;
    let pixQrY: number | null = null;

    if (data.status === 'Pendente' && pixQrCodeDataUrl) {
      // Posicionar abaixo dos dados do emitente, mas garantir espaço suficiente
      pixQrY = emitidoPorY + 1; // Abaixo dos dados do emitente
      const pixQrSize = 24; // Reduzido ainda mais
      const pixQrX = margin;
      const pixBoxHeight = pixQrSize + 10; // Altura reduzida do box

      // Verificar se há espaço suficiente antes das notas e se não sobrepõe a assinatura
      const assinaturaStartY = notaRodapeY - 20;
      if (pixQrY && pixQrY + pixBoxHeight < assinaturaStartY - 2 && pixQrY + pixBoxHeight < notaRodapeY - 3) {
        // Box destacado para PIX (mais sutil)
        pdf.setFillColor(240, 253, 244); // emerald-50 mais claro
        pdf.setDrawColor(16, 185, 129); // emerald-600
        pdf.setLineWidth(0.5);
        pdf.roundedRect(pixQrX - 3, pixQrY - 3, pixQrSize + 6, pixBoxHeight, 1.5, 1.5, 'FD');

        pdf.addImage(pixQrCodeDataUrl, 'PNG', pixQrX, pixQrY, pixQrSize, pixQrSize);

        pdf.setFontSize(6);
        pdf.setTextColor(16, 185, 129); // emerald-600
        pdf.setFont('helvetica', 'bold');
        pdf.text('PIX - Escaneie para pagar', pixQrX + (pixQrSize / 2), pixQrY + pixQrSize + 3, { align: 'center' });

        if (pixKey) {
          pdf.setFontSize(5);
          pdf.setTextColor(80, 80, 80);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Chave: ${pixKey}`, pixQrX + (pixQrSize / 2), pixQrY + pixQrSize + 6, { align: 'center' });
        }

        // Código PIX Copia e Cola (se houver espaço suficiente)
        if (pixPayload && pixQrY + pixBoxHeight + 10 < notaRodapeY - 5) {
          const pixCodeY = pixQrY + pixQrSize + 9;
          pdf.setFontSize(5);
          pdf.setTextColor(16, 185, 129); // emerald-600
          pdf.setFont('helvetica', 'bold');
          pdf.text('Código PIX Copia e Cola:', margin + pixQrSize + 10, pixCodeY);

          const pixCodeY2 = pixCodeY + 3;
          pdf.setFontSize(4);
          pdf.setFont('courier', 'normal');
          pdf.setTextColor(40, 40, 40);
          const pixLines = pdf.splitTextToSize(pixPayload, contentWidth - pixQrSize - 20);
          const pixLinesHeight = pixLines.length * 2.5;

          // Verificar se há espaço para o código PIX antes de adicionar
          if (pixCodeY2 + pixLinesHeight < notaRodapeY - 5) {
            pdf.text(pixLines, margin + pixQrSize + 10, pixCodeY2);
          }
        }

        // Atualizar yPos para considerar o QR Code PIX
        yPos = Math.max(yPos, pixQrY + pixBoxHeight + 2);
      }
    }

    // Assinatura Digital com Hash (lado esquerdo, abaixo dos dados do emitente) - compacto
    const maxAssinaturaY = notaRodapeY - 16; // Deixar espaço antes das notas

    let assinaturaY = yPos + 1.5;

    // Ajustar se estiver muito próximo do QR Code PIX ou das notas
    if (data.status === 'Pendente' && pixQrCodeDataUrl && pixQrY) {
      const pixQrBottom = pixQrY + 24 + 10; // pixQrY + pixQrSize + box height
      assinaturaY = Math.max(assinaturaY, pixQrBottom + 1.5);
    }

    // Garantir que não ultrapasse o limite antes das notas
    assinaturaY = Math.min(assinaturaY, maxAssinaturaY);

    // Verificar se há espaço suficiente antes de adicionar assinatura
    if (assinaturaY + 12 < notaRodapeY) {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, assinaturaY, margin + 55, assinaturaY);
      pdf.setFontSize(6.5);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ASSINATURA CORPORATIVA', margin + 27.5, assinaturaY + 2.5, { align: 'center' });

      // Hash sempre está disponível (foi gerado acima)
      let hashY = assinaturaY + 5.5;

      // Verificar se há espaço para o hash antes de adicionar
      if (hashY + 12 < notaRodapeY) {
        pdf.setFontSize(4.5);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('helvetica', 'bold');
        pdf.text('HASH ÚNICO DE AUTENTICAÇÃO:', margin, hashY);
        hashY += 3.5;
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(3.5);
        pdf.setTextColor(40, 40, 40);
        const hashLines = pdf.splitTextToSize(hash, 65);
        pdf.text(hashLines, margin, hashY);
        hashY += (hashLines.length * 2.2) + 1.5;

        // Verificar espaço para texto adicional
        if (hashY + 3 < notaRodapeY) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(3);
          pdf.setTextColor(100, 100, 100);
          pdf.text('Este hash garante a autenticidade e integridade deste documento.', margin, hashY);
        }
      }
    }

    // Nota de rodapé (sempre no final da última página) - compacto
    const notaY = pageHeight - 22;
    const notaHeight = 7;

    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(margin, notaY, contentWidth, notaHeight, 1.5, 1.5, 'F');

    pdf.setFontSize(5);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    const nota = 'Este recibo possui validade jurídica e comprova o pagamento realizado. Guarde-o para fins de comprovação e controle financeiro.';
    const notaLines = pdf.splitTextToSize(nota, contentWidth - 4);
    pdf.text(notaLines, pageWidth / 2, notaY + 2, { align: 'center' });

    // Nota de Verificação (sempre no final da última página) - compacto
    const verificacaoY = pageHeight - 12;
    const verificacaoHeight = 7;

    pdf.setFillColor(240, 240, 240);
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(margin, verificacaoY, contentWidth, verificacaoHeight, 1.5, 1.5, 'FD');

    pdf.setFontSize(5);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOTA DE VERIFICAÇÃO', pageWidth / 2, verificacaoY + 3, { align: 'center' });

    pdf.setFontSize(4);
    pdf.setFont('courier', 'normal');
    pdf.setTextColor(60, 60, 60);
    const dataHoraVerificacao = formatarDataHoraCompleta();
    pdf.text(`Documento verificado em: ${dataHoraVerificacao}`, pageWidth / 2, verificacaoY + 5.5, { align: 'center' });

    pdf.setFontSize(3.5);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text('Esta data e hora servem para autenticar a consulta deste documento no sistema.', pageWidth / 2, verificacaoY + 8, { align: 'center' });

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

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ReciboData } from '@/types/recibo';
import { formatarMoeda, formatarData, formatarCPFCNPJ } from '@/lib/utils';
import { drawLogoPDF } from '@/lib/logo-pdf';

export async function POST(request: NextRequest) {
  try {
    const data: ReciboData = await request.json();

    // Gerar QR Code
    const qrCodeDataString = JSON.stringify({
      numero: data.numero,
      valor: data.valor,
      data: data.data,
      emitente: data.emitidoPor
    });

    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeDataString, {
      width: 120,
      margin: 1
    });

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
    let yPos = drawLogoPDF(pdf, pageWidth / 2, 15);

    // Título RECIBO
    yPos += 10;
    pdf.setFontSize(28);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECIBO', pageWidth / 2, yPos, { align: 'center' });

    // Número e Data
    yPos += 5;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Nº ${data.numero}`, pageWidth - margin, yPos - 5, { align: 'right' });
    pdf.text(formatarData(data.data), pageWidth - margin, yPos, { align: 'right' });

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

    yPos += 5;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(`CPF: ${formatarCPFCNPJ(data.cpfEmitente)}`, margin, yPos);

    yPos += 5;
    pdf.text(data.enderecoEmitente, margin, yPos);

    yPos += 5;
    pdf.text(`Tel: ${data.telefoneEmitente}`, margin, yPos);

    yPos += 5;
    pdf.text(`Email: ${data.emailEmitente}`, margin, yPos);

    // Linha de assinatura
    yPos += 15;
    pdf.setDrawColor(150, 150, 150);
    pdf.line(margin, yPos, margin + 70, yPos);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Assinatura do Emitente', margin + 35, yPos + 4, { align: 'center' });

    // QR Code
    const qrSize = 35;
    const qrX = pageWidth - margin - qrSize;
    const qrY = pageHeight - 75;
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Código de Verificação', qrX + (qrSize / 2), qrY + qrSize + 4, { align: 'center' });

    // Nota de rodapé
    yPos = pageHeight - 20;
    pdf.setFillColor(250, 250, 250);
    pdf.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');

    pdf.setFontSize(7);
    pdf.setTextColor(120, 120, 120);
    pdf.setFont('helvetica', 'normal');
    const nota = 'Este recibo possui validade jurídica e comprova o pagamento realizado. Guarde-o para fins de comprovação e controle financeiro.';
    const notaLines = pdf.splitTextToSize(nota, contentWidth - 4);
    pdf.text(notaLines, pageWidth / 2, yPos + 4, { align: 'center' });

    // Gerar PDF como Buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recibo-${data.numero}.pdf"`
      }
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF' },
      { status: 500 }
    );
  }
}


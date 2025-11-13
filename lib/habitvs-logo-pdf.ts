import fs from 'fs';
import { jsPDF } from 'jspdf';
import path from 'path';

/**
 * Adiciona o logo da Habitvs no rodapé do PDF
 * Usa versão dark para PDFs (fundo branco)
 */
export function drawHabitvsLogoPDF(pdf: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
  try {
    // Usar versão dark para PDFs (fundo branco)
    const logoPath = path.join(process.cwd(), 'public', 'habitvs-dark.png');

    if (fs.existsSync(logoPath)) {
      try {
        const logoData = fs.readFileSync(logoPath);
        if (!logoData || logoData.length === 0) {
          throw new Error('Logo Habitvs vazio');
        }
        const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

        // Posicionar no rodapé, alinhado à direita
        const logoWidth = 30;
        const logoHeight = 10;
        const logoX = pageWidth - margin - logoWidth;
        const logoY = pageHeight - margin - 8;

        // Adicionar logo
        pdf.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);

        // Texto "Tecnologia por Habitvs" à esquerda do logo
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);

        const textY = logoY + logoHeight / 2;
        const textX = logoX - 2;

        pdf.text('Tecnologia por', textX, textY - 2, { align: 'right' });
        pdf.setFont('helvetica', 'bold');
        pdf.text('Habitvs', textX, textY + 1, { align: 'right' });
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(4);
        pdf.text('empoderando o setor imobiliário', textX, textY + 4, { align: 'right' });

        return true;
      } catch (fileError) {
        console.warn('Erro ao processar logo Habitvs PNG:', fileError);
        return false;
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar logo Habitvs:', error);
    return false;
  }

  return false;
}


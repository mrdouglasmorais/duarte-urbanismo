import fs from 'fs';
import { jsPDF } from 'jspdf';
import path from 'path';

export function drawLogoPDF(pdf: jsPDF, centerX: number, startY: number) {
  try {
    // Tentar carregar logo PNG
    const logoPath = path.join(process.cwd(), 'public', 'logo_duarte_sem_fundo.png');
    if (fs.existsSync(logoPath)) {
      try {
        const logoData = fs.readFileSync(logoPath);
        if (!logoData || logoData.length === 0) {
          throw new Error('Logo vazio');
        }
        const logoBase64 = `data:image/png;base64,${logoData.toString('base64')}`;

        // Dimensões do logo (ajustar conforme necessário)
        const logoWidth = 60;
        const logoHeight = 20;
        const logoX = centerX - logoWidth / 2;

        pdf.addImage(logoBase64, 'PNG', logoX, startY, logoWidth, logoHeight);

        // Texto abaixo do logo
        let yPos = startY + logoHeight + 8;
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DUARTE URBANISMO LTDA', centerX, yPos, { align: 'center' });

        yPos += 5;
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('CNPJ: 47.200.760/0001-06', centerX, yPos, { align: 'center' });

        return yPos + 5;
      } catch (fileError) {
        console.warn('Erro ao processar logo PNG:', fileError);
        throw fileError;
      }
    }
  } catch (error) {
    console.warn('Erro ao carregar logo PNG, usando logo SVG:', error);
  }

  // Fallback: Logo SVG (código original)
  const iconX = centerX;
  const iconY = startY;
  const radius = 8;

  pdf.setFillColor(0, 0, 0);
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);

  pdf.circle(iconX + 4, iconY, radius, 'F');
  pdf.rect(iconX - 4, iconY - radius, 8, radius * 2, 'F');

  pdf.setFillColor(255, 255, 255);

  pdf.triangle(
    iconX - 1.5, iconY + 2,
    iconX + 1.5, iconY + 2,
    iconX, iconY - 2,
    'F'
  );

  pdf.rect(iconX - 1.5, iconY + 2, 3, 3, 'F');

  let yPos = startY + 30;
  pdf.setFontSize(36);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DUARTE', centerX, yPos, { align: 'center' });

  yPos += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('URBANISMO', centerX, yPos, { align: 'center' });

  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DUARTE URBANISMO LTDA', centerX, yPos, { align: 'center' });

  yPos += 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CNPJ: 47.200.760/0001-06', centerX, yPos, { align: 'center' });

  return yPos + 5;
}


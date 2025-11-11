import { jsPDF } from 'jspdf';

export function drawLogoPDF(pdf: jsPDF, centerX: number, startY: number) {
  // Ícone D com casa
  const iconX = centerX;
  const iconY = startY;
  const radius = 8;

  // Desenhar o D (semicírculo + retângulo)
  pdf.setFillColor(0, 0, 0);
  pdf.setDrawColor(0, 0, 0);
  pdf.setLineWidth(1);

  // Semicírculo direito
  pdf.circle(iconX + 4, iconY, radius, 'F');

  // Retângulo esquerdo do D
  pdf.rect(iconX - 4, iconY - radius, 8, radius * 2, 'F');

  // Desenhar casa interna (branca)
  pdf.setFillColor(255, 255, 255);

  // Telhado (triângulo)
  pdf.triangle(
    iconX - 1.5, iconY + 2,  // ponto esquerdo
    iconX + 1.5, iconY + 2,  // ponto direito
    iconX, iconY - 2,        // ponto topo
    'F'
  );

  // Base da casa (retângulo)
  pdf.rect(iconX - 1.5, iconY + 2, 3, 3, 'F');

  // Texto DUARTE
  let yPos = startY + 30;
  pdf.setFontSize(36);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DUARTE', centerX, yPos, { align: 'center' });

  // Texto URBANISMO
  yPos += 10;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('URBANISMO', centerX, yPos, { align: 'center' });

  // Texto DUARTE URBANISMO LTDA
  yPos += 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DUARTE URBANISMO LTDA', centerX, yPos, { align: 'center' });

  // Texto CNPJ
  yPos += 5;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CNPJ: 47.200.760/0001-06', centerX, yPos, { align: 'center' });

  return yPos + 5; // Retorna a posição Y final para continuar o documento
}


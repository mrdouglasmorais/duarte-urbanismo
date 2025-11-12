import { buildQrCodePayload, generateReciboHash } from '@/lib/authenticity';
import { sanitizeReciboData, validateReciboData } from '@/lib/recibos';
import { ReciboData } from '@/types/recibo';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload: ReciboData = await request.json();
    const data = sanitizeReciboData(payload);
    const validationErrors = validateReciboData(data);

    if (validationErrors.length > 0) {
      return NextResponse.json({ errors: validationErrors }, { status: 400 });
    }

    const hash = generateReciboHash(data);
    const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const qrPayload = buildQrCodePayload(data, hash, origin);

    return NextResponse.json({
      hash,
      qrPayload
    });
  } catch (error) {
    console.error('Erro ao gerar assinatura do recibo:', error);
    return NextResponse.json(
      { error: 'Não foi possível gerar a assinatura do recibo.' },
      { status: 500 }
    );
  }
}


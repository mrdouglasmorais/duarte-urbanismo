import { buildQrCodePayload, generateReciboHash } from '@/lib/authenticity';
import { APP_BASE_URL } from '@/lib/constants';
import { sanitizeReciboData, validateReciboData } from '@/lib/recibos';
import { saveRecibo } from '@/lib/recibos-repository';
import { ReciboData } from '@/types/recibo';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    let payload: ReciboData;
    try {
      payload = await request.json();
    } catch (error) {
      console.error('Erro ao parsear JSON:', error);
      return NextResponse.json(
        { error: 'Formato de dados inválido' },
        { status: 400 }
      );
    }

    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { error: 'Dados do recibo não fornecidos' },
        { status: 400 }
      );
    }

    let data: ReciboData;
    try {
      data = sanitizeReciboData(payload);
    } catch (error) {
      console.error('Erro ao sanitizar dados:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao processar dados do recibo' },
        { status: 400 }
      );
    }

    const validationErrors = validateReciboData(data);
    if (validationErrors.length > 0) {
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
      console.error('Erro ao salvar recibo:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao salvar recibo no banco de dados' },
        { status: 500 }
      );
    }

    const origin = request.headers.get('origin') ?? APP_BASE_URL;
    const qrPayload = buildQrCodePayload(data, hash, origin, shareId, {
      pixPayload: data.pixPayload,
      pixKey: data.pixKey
    });

    return NextResponse.json({
      hash,
      qrPayload
    });
  } catch (error) {
    console.error('Erro ao gerar assinatura do recibo:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Não foi possível gerar a assinatura do recibo.' },
      { status: 500 }
    );
  }
}


import { buildQrCodePayload } from '@/lib/authenticity';
import { APP_BASE_URL } from '@/lib/constants';
import { findReciboByShareId } from '@/lib/recibos-repository';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ShareRouteContext {
  params: Promise<{ shareId: string }>;
}

export async function GET(request: NextRequest, context: ShareRouteContext) {
  try {
    let shareId: string;
    try {
      const params = await context.params;
      shareId = params?.shareId;
    } catch (error) {
      console.error('Erro ao obter parâmetros:', error);
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    if (!shareId || typeof shareId !== 'string' || shareId.trim().length === 0) {
      return NextResponse.json(
        { error: 'ID de compartilhamento inválido' },
        { status: 400 }
      );
    }

    let record;
    try {
      record = await findReciboByShareId(shareId.trim());
    } catch (error) {
      console.error('Erro ao buscar recibo:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Erro ao buscar recibo no banco de dados' },
        { status: 500 }
      );
    }

    if (!record) {
      return NextResponse.json({ error: 'Recibo não encontrado.' }, { status: 404 });
    }

    if (!record.hash) {
      console.error('Recibo sem hash:', record.numero);
      return NextResponse.json(
        { error: 'Recibo inválido: hash ausente' },
        { status: 500 }
      );
    }

    const { hash, ...recibo } = record;
    const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') ?? 'https';
    const origin = forwardedHost ? `${protocol}://${forwardedHost}` : APP_BASE_URL;

    let qrPayload;
    try {
      qrPayload = buildQrCodePayload(recibo, hash, origin, record.shareId, {
        pixPayload: record.pixPayload,
        pixKey: record.pixKey
      });
    } catch (error) {
      console.error('Erro ao gerar QR payload:', error);
      return NextResponse.json(
        { error: 'Erro ao gerar código de verificação' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recibo, qrPayload });
  } catch (error) {
    console.error('Erro ao buscar recibo compartilhado:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao consultar recibo.' },
      { status: 500 }
    );
  }
}

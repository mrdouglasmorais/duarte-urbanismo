import { NextRequest, NextResponse } from 'next/server';
import { buildQrCodePayload } from '@/lib/authenticity';
import { findReciboByShareId } from '@/lib/recibos-repository';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { shareId: string } }) {
  try {
    const shareId = params.shareId;
    const record = await findReciboByShareId(shareId);

    if (!record) {
      return NextResponse.json({ error: 'Recibo não encontrado.' }, { status: 404 });
    }

    const { hash, ...recibo } = record;
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const qrPayload = buildQrCodePayload(recibo, hash, origin, record.shareId, {
      pixPayload: record.pixPayload,
      pixKey: record.pixKey
    });

    return NextResponse.json({ recibo, qrPayload });
  } catch (error) {
    console.error('Erro ao buscar recibo compartilhado:', error);
    return NextResponse.json({ error: 'Falha ao consultar recibo.' }, { status: 500 });
  }
}

import { buildShareUrl, generateReciboHash } from '@/lib/authenticity';
import { findReciboByNumero } from '@/lib/recibos-repository';
import { NextRequest, NextResponse } from 'next/server';
import { APP_BASE_URL } from '@/lib/constants';

interface RouteContext {
  params: Promise<{ numero: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { numero } = await context.params;
    const decodedNumero = decodeURIComponent(numero);
    const hashParam = request.nextUrl.searchParams.get('hash') || undefined;

    const recibo = await findReciboByNumero(decodedNumero);

    if (!recibo) {
      return NextResponse.json(
        { valid: false, reason: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const expectedHash = generateReciboHash(recibo);
    const hashMatches = recibo.hash === expectedHash;
    const providedHashMatches = hashParam ? hashParam === recibo.hash : undefined;
    const origin = request.headers.get('origin') ?? APP_BASE_URL;

    return NextResponse.json({
      valid: hashMatches && (providedHashMatches ?? true),
      hashMatches,
      providedHashMatches,
      recibo: {
        numero: recibo.numero,
        valor: recibo.valor,
        valorExtenso: recibo.valorExtenso,
        recebidoDe: recibo.recebidoDe,
        cpfCnpj: recibo.cpfCnpj,
        referente: recibo.referente,
        data: recibo.data,
        formaPagamento: recibo.formaPagamento,
        emitidoPor: recibo.emitidoPor,
        cpfEmitente: recibo.cpfEmitente,
        cepEmitente: recibo.cepEmitente,
        enderecoEmitente: recibo.enderecoEmitente,
        telefoneEmitente: recibo.telefoneEmitente,
        emailEmitente: recibo.emailEmitente,
        shareId: recibo.shareId,
        shareUrl: buildShareUrl(recibo.shareId, origin),
        hash: recibo.hash,
        createdAt: recibo.createdAt,
        updatedAt: recibo.updatedAt
      }
    });
  } catch (error) {
    console.error('Erro ao verificar recibo:', error);
    return NextResponse.json(
      { valid: false, reason: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}


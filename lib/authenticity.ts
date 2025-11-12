import { ReciboData } from '@/types/recibo';
import crypto from 'crypto';

const hashSecret = process.env.RECIBO_HASH_SECRET || '';

function canonicalize(data: ReciboData): string {
  const fields = [
    data.numero.trim().toUpperCase(),
    data.valor.toFixed(2),
    data.data,
    data.recebidoDe.trim().toUpperCase(),
    data.cpfCnpj.replace(/\D/g, ''),
    data.referente.trim().toUpperCase(),
    data.formaPagamento.trim().toUpperCase(),
    data.emitidoPor.trim().toUpperCase(),
    data.cpfEmitente.replace(/\D/g, ''),
    data.enderecoEmitente.trim().toUpperCase(),
    data.telefoneEmitente.replace(/\D/g, ''),
    data.emailEmitente.trim().toLowerCase()
  ];

  return fields.join('|');
}

export function generateReciboHash(data: ReciboData): string {
  const payload = canonicalize(data);
  const content = hashSecret ? `${payload}|${hashSecret}` : payload;
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function buildVerificationUrl(numero: string, hash: string, origin?: string): string {
  const baseUrl = (origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/api/recibos/${encodeURIComponent(numero)}?hash=${encodeURIComponent(hash)}`;
}

export function buildShareUrl(shareId: string, origin?: string): string {
  const baseUrl = (origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/recibos/share/${encodeURIComponent(shareId)}`;
}

interface QrExtraOptions {
  pixPayload?: string;
  pixKey?: string;
}

export function buildQrCodePayload(
  data: ReciboData,
  hash: string,
  origin?: string,
  shareId?: string,
  options?: QrExtraOptions
) {
  return {
    numero: data.numero,
    valor: data.valor,
    data: data.data,
    emitente: data.emitidoPor,
    hash,
    verifyUrl: buildVerificationUrl(data.numero, hash, origin),
    shareUrl: shareId ? buildShareUrl(shareId, origin) : undefined,
    pixKey: options?.pixKey ?? data.pixKey,
    pixPayload: options?.pixPayload ?? data.pixPayload
  };
}


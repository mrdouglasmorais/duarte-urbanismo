import PixCopyButton from '@/components/PixCopyButton';
import ReciboPreviewWithActions from '@/components/ReciboPreviewWithActions';
import { APP_BASE_URL } from '@/lib/constants';
import { ReciboData } from '@/types/recibo';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

async function fetchRecibo(shareId: string, baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/recibos/share/${shareId}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ReciboSharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') ?? 'https';
  const baseUrl = host ? `${protocol}://${host}` : APP_BASE_URL;
  const data = await fetchRecibo(shareId, baseUrl);

  if (!data) {
    notFound();
  }

  const recibo: ReciboData = data.recibo;
  const qrPayload = data.qrPayload;
  const shareUrl = data.recibo.shareUrl || '#';
  const pixKey = data.recibo.pixKey ?? qrPayload?.pixKey;
  const pixPayload = qrPayload?.pixPayload ?? data.recibo.pixPayload;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 text-center">
        <div className="no-print">
          <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Recibo oficial</p>
          <h1 className="text-3xl font-semibold text-slate-900">Consulta pública do recibo</h1>
          <p className="text-sm text-slate-600">
            Este recibo foi compartilhado através de link seguro. Utilize o QR Code ou o botão abaixo para validar a
            autenticidade.
          </p>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Link de verificação</p>
            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white"
            >
              {shareUrl}
            </a>
          </div>
          {pixKey && pixPayload && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Pagamento via PIX</p>
              <p className="mt-2 font-semibold">Chave: {pixKey}</p>
              <PixCopyButton
                payload={pixPayload}
                className="mt-3 inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700 hover:bg-emerald-100"
              />
              <pre className="mt-3 whitespace-pre-wrap wrap-break-word rounded-2xl bg-white/70 p-3 text-left text-xs text-emerald-700">
                {pixPayload}
              </pre>
            </div>
          )}
        </div>
        <div className="rounded-[40px] border border-slate-200 bg-white/95 p-6 shadow-xl no-print-wrapper">
          <ReciboPreviewWithActions
            data={recibo}
            qrCodeData={JSON.stringify(qrPayload)}
            baseUrl={baseUrl}
          />
        </div>
      </div>
    </div>
  );
}

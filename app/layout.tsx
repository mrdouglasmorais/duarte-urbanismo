import type { Metadata } from 'next';
import { Manrope, Playfair_Display, Ephesis } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap'
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
});

const ephesis = Ephesis({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-ephesis',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'S.G.C.I - Sistema de Gestão de Contratos Imobiliários',
  description:
    'Aplicação completa para gestão de empreendimentos, clientes, negociações e parcelas com foco em rastreabilidade.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${playfair.variable} ${ephesis.variable} antialiased bg-slate-50 text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://duarteurbanismo.com.br'),
  title: {
    default: 'Pôr do Sol Eco Village | Condomínio Sustentável em Tijucas/SC | Duarte Urbanismo',
    template: '%s | Duarte Urbanismo'
  },
  description:
    'Pôr do Sol Eco Village: Condomínio residencial sustentável em Tijucas/SC. Lotes de 1.000m² a 3.500m², 32 áreas de lazer, infraestrutura completa. Investimento a partir de R$ 350/m². O condomínio mais sustentável de Tijucas.',
  keywords: [
    'Pôr do Sol Eco Village',
    'condomínio sustentável Tijucas',
    'chácaras Tijucas SC',
    'lotes Tijucas',
    'Duarte Urbanismo',
    'empreendimento sustentável Santa Catarina',
    'condomínio residencial Tijucas',
    'lotes amplos Tijucas',
    'chácara Tijucas',
    'condomínio ecológico SC',
    'investimento imobiliário Tijucas',
    'lotes a partir de 1000m²',
    'condomínio com lazer Tijucas',
    'Bairro Itinga Tijucas',
    'BR-101 Tijucas'
  ],
  authors: [{ name: 'Duarte Urbanismo' }],
  creator: 'Duarte Urbanismo',
  publisher: 'Duarte Urbanismo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Duarte Urbanismo',
    title: 'Pôr do Sol Eco Village | Condomínio Sustentável em Tijucas/SC',
    description:
      'Condomínio residencial sustentável em Tijucas/SC. Lotes de 1.000m² a 3.500m², 32 áreas de lazer, infraestrutura completa. O condomínio mais sustentável de Tijucas.',
    images: [
      {
        url: '/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg',
        width: 1200,
        height: 630,
        alt: 'Pôr do Sol Eco Village - Condomínio Sustentável em Tijucas/SC',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pôr do Sol Eco Village | Condomínio Sustentável em Tijucas/SC',
    description:
      'Condomínio residencial sustentável em Tijucas/SC. Lotes de 1.000m² a 3.500m², 32 áreas de lazer, infraestrutura completa.',
    images: ['/modern-luxury-house-with-swimming-pool-at-sunset-2025-02-10-06-40-44-utc.jpg'],
    creator: '@duarteurbanismo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
  },
  verification: {
    // Adicione aqui os códigos de verificação quando disponíveis
    // google: 'seu-codigo-google',
    // yandex: 'seu-codigo-yandex',
    // yahoo: 'seu-codigo-yahoo',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${playfair.variable} antialiased bg-slate-50 text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

export default function SEO() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Duarte Urbanismo',
    description:
      'Duarte Urbanismo - Empreendimento Pôr do Sol Eco Village. Condomínio residencial sustentável em Tijucas/SC.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://duarteurbanismo.com.br',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://duarteurbanismo.com.br'}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua José Antonio da Silva, 152 · Sala 03, Escritório 81, Centro',
      addressLocality: 'São João Batista',
      addressRegion: 'SC',
      postalCode: '88.240-000',
      addressCountry: 'BR',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+55-47-9211-2284',
      contactType: 'customer service',
      areaServed: 'BR',
      availableLanguage: 'Portuguese',
    },
    sameAs: [
      // Adicione links de redes sociais quando disponíveis
      // 'https://www.facebook.com/duarteurbanismo',
      // 'https://www.instagram.com/duarteurbanismo',
    ],
  };

  const placeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: 'Pôr do Sol Eco Village',
    description:
      'Condomínio residencial sustentável em Tijucas/SC. Lotes de 1.000m² a 3.500m², 32 áreas de lazer, infraestrutura completa.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tijucas',
      addressRegion: 'SC',
      addressCountry: 'BR',
      streetAddress: 'Bairro Itinga',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '-27.2406',
      longitude: '-48.6339',
    },
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Pôr do Sol Eco Village - Lote Residencial',
    description:
      'Lotes residenciais em condomínio sustentável. Áreas de 1.000m² a 3.500m² com infraestrutura completa e 32 áreas de lazer.',
    brand: {
      '@type': 'Brand',
      name: 'Duarte Urbanismo',
    },
    offers: {
      '@type': 'Offer',
      price: '350.00',
      priceCurrency: 'BRL',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '350.00',
        priceCurrency: 'BRL',
        unitCode: 'MTK',
      },
      availability: 'https://schema.org/InStock',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://duarteurbanismo.com.br',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: '1',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(placeJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </>
  );
}


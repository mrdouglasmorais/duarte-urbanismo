import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    unoptimized: false,
  },
  // Configuração para silenciar warning sobre lockfiles múltiplos
  outputFileTracingRoot: process.cwd(),
  // Configuração webpack para tratar firebase-admin e módulos Node.js corretamente
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Garantir que firebase-admin e suas dependências sejam tratadas como externas
      config.externals = config.externals || [];

      // Função para verificar se deve ser externo
      const externalsFunction = (context: string, request: string, callback: Function) => {
        // firebase-admin e suas dependências
        if (
          request === 'firebase-admin' ||
          request.startsWith('firebase-admin/') ||
          request.startsWith('@firebase/') ||
          request.includes('google-auth-library') ||
          request.includes('gcp-metadata') ||
          request.includes('google-logging-utils') ||
          // Módulos Node.js nativos
          request.startsWith('node:')
        ) {
          return callback(null, `commonjs ${request}`);
        }
        callback();
      };

      if (Array.isArray(config.externals)) {
        config.externals.push(externalsFunction);
        config.externals.push('firebase-admin');
      } else if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          externalsFunction,
          'firebase-admin',
        ];
      } else {
        config.externals = [
          config.externals,
          externalsFunction,
          'firebase-admin',
        ];
      }

      // Resolver fallbacks para módulos Node.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    return config;
  },
  // Configuração turbopack vazia para evitar conflito
  turbopack: {},
};

export default nextConfig;

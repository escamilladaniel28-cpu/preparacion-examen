import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 1. Evita que Turbopack intente empaquetar Prisma (soluciona el error del módulo)
  serverExternalPackages: ['@prisma/client'],

  // 2. Configuración de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        // Dominio de tu bucket de S3 en AWS
        hostname: 'workia-s3-img-535540411837-us-east-2-an.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
      // Mantengo el comodín por si subes imágenes de otros lados, 
      // aunque lo ideal en producción es tener solo los dominios estrictos.
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  // 3. Headers de caché (los que ya tenías para evitar que se guarde en caché el admin)
  async headers() {
    return [
      {
        source: '/(private)/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/dashboard/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },
    ];
  },
};

export default nextConfig;
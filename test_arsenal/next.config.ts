import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {},
  },
  generateBuildId: async () => 'build',
};

export default nextConfig;

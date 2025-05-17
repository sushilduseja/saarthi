
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Added for Capacitor compatibility with server features
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'covers.openlibrary.org',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;

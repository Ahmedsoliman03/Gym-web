import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8001',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
      },
      {
        // wger exercise images (exercise DB integration)
        protocol: 'https',
        hostname: 'wger.de',
      }
    ],
  },
};

export default withNextIntl(nextConfig);

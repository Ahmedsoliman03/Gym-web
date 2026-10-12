import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/platform',
  skipTrailingSlashRedirect: true,
  experimental: {
    // Transform these barrel imports so only the icons/entrypoints actually used
    // are pulled into the module graph. lucide-react is already covered by Next's
    // built-in defaults; @fluentui/react-icons (a very large barrel) and the
    // @tanstack/* packages are not — this cuts compile time and prevents
    // over-inclusion in route bundles.
    optimizePackageImports: ['@fluentui/react-icons', '@tanstack/react-query'],
  },
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

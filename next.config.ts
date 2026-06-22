import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  // Don't 308-redirect `/path/` → `/path`. The API proxy forwards trailing
  // slashes to the backend (Django's APPEND_SLASH needs them); a redirect would
  // also strip the slash before the handler runs and can drop a POST body.
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
      }
    ],
  },
};

export default withNextIntl(nextConfig);

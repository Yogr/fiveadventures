/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ebmwfcmwnnbeyjxeadmj.supabase.co',
        pathname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'five-adventures.com'],
    },
    optimizePackageImports: ['@/components'],
  },
  poweredByHeader: false,
};

module.exports = nextConfig;

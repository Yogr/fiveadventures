/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  webpack: (config, { isServer }) => {
    // Optimize chunk loading
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        // Vendor chunk for third-party modules
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          priority: 20,
        },
        // Common chunk for shared code
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 10,
          reuseExistingChunk: true,
          enforce: true,
        },
      },
    };
    
    return config;
  },
};

module.exports = nextConfig;

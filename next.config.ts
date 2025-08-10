import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    turbo: {
      // Turbopack optimizations
    },
  },

  // Optimize images
  images: {
    unoptimized: false,
    remotePatterns: [],
  },

  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,

  // Optimize webpack for development
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable webpack cache to prevent filesystem issues
      config.cache = false;

      // Optimize resolve for faster builds
      config.resolve.symlinks = false;

      // Reduce file watching overhead
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
        ],
      };
    }

    return config;
  },
};

export default nextConfig;

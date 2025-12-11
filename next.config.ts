import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Required for Electron - use relative paths for all assets
  assetPrefix: './',
  basePath: '',
};

export default nextConfig;

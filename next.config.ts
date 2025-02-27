// next.config.js
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['cdn.sanity.io'], // Add Sanity's image CDN domain
  },
  // Optional: Add other Next.js configuration options here
  reactStrictMode: true,
  swcMinify: true,
  // Enable if you're using styled-components
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;
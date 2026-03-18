import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: '**.s3.ap-southeast-1.amazonaws.com' },
    ],
  },
};

export default nextConfig;

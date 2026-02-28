import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cmsassets.rgpub.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.rgpub.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.riftcodex.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig

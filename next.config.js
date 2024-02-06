const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.S3_IMAGE_DOMAIN
      }
    ]
  }
}

module.exports = nextConfig
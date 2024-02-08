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
  outputFileTracing: false
}

module.exports = nextConfig
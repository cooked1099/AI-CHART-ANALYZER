/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['multer'],
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig
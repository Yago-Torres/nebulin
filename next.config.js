/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fdutuxjeqjfybsbkxgij.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/avatars/**',
      },
    ],
    domains: ['fdutuxjeqjfybsbkxgij.supabase.co'],
  },
}

module.exports = nextConfig 
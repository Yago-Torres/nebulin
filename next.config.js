/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xsgames.co',
        port: '',
        pathname: '/randomusers/**',
      },
    ],
    domains: ['fdutuxjeqjfybsbkxgij.supabase.co'],
  },
}

module.exports = nextConfig 
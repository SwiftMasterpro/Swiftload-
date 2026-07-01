/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol:'https', hostname:'pyiduregtpbynsjrnhua.supabase.co' },
      { protocol:'https', hostname:'lh3.googleusercontent.com' },
      { protocol:'https', hostname:'avatars.githubusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',         value: 'DENY' },
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',       value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
        ],
      },
      {
        source: '/api/webhooks/stripe',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
  experimental: { serverComponentsExternalPackages: ['stripe'] },
  compiler: { removeConsole: process.env.NODE_ENV === 'production' },
}
module.exports = nextConfig

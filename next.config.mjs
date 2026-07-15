import withPWA from 'next-pwa'

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV !== 'production',
})

const nextConfig = {
  turbopack: {},
}

export default withPWAConfig(nextConfig)
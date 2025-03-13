let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['images.unsplash.com', 'via.placeholder.com', 'res.cloudinary.com'],
  },
  output: 'standalone',
  experimental: {
    webpackBuildWorker: true,
    serverActions: true,
  },
  // Configure SWC compiler options
  compiler: {
    styledComponents: true,
  },
  // Map prefixed environment variables to standard ones
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.crawlmetric_NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.crawlmetric_NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.crawlmetric_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.crawlmetric_SUPABASE_SERVICE_ROLE_KEY,
    DATAFORSEO_USERNAME: process.env.crawlmetric_DATAFORSEO_USERNAME,
    DATAFORSEO_PASSWORD: process.env.crawlmetric_DATAFORSEO_PASSWORD,
    DATAFORSEO_API_ID: process.env.crawlmetric_DATAFORSEO_API_ID,
    DATAFORSEO_API_KEY: process.env.crawlmetric_DATAFORSEO_API_KEY
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig

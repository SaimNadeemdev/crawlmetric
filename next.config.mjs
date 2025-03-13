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
  }
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

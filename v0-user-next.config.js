/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  // Explicitly set the JSX runtime
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true,
  },
  // Ensure we're using the new JSX transform
  experimental: {
    esmExternals: "loose",
  },
}

module.exports = nextConfig


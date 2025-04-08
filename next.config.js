/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Only include specific Node.js modules in the server build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // Ensure serverless builds work properly
  experimental: {
    serverComponentsExternalPackages: ['@upstash/redis'],
  },
}

module.exports = nextConfig
import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    // Limit webpack to 1 worker to reduce memory usage in dev
    cpus: 1,
  },

  webpack(config, { dev }) {
    config.resolve.alias["@"] = path.resolve(__dirname)

    if (dev) {
      // Disable parallel builds and source maps in dev to save memory
      config.parallelism = 1
      config.cache = false
    }
    return config
  },
}

export default nextConfig
